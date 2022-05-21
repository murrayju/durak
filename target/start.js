import config from '@murrayju/config';
import path from 'path';
import express from 'express';
import browserSync from 'browser-sync';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware';
import { format, onKillSignal, buildLog, dockerNetworkCreate } from 'build-strap';
import fs from 'fs-extra';
import chokidar from 'chokidar';

import webpackConfig from './webpack.config';
import run from './run';
import clean from './clean';
import lint from './lint';
import yarn from './yarn';
import copy from './copy';
import generateSrc from './generateSrc';
import { runDbContainer, dockerTeardown } from './docker';

const isDebug = !process.argv.includes('--release');

// https://webpack.js.org/configuration/watch/#watchoptions
const watchOptions = {
  // Watching may not work with NFS and machines in VirtualBox
  // Uncomment next line if it is your case (use true or interval in milliseconds)
  // poll: true,
  // Decrease CPU or memory usage in some file systems
  // ignored: /node_modules/,
};
const hmrPrefix = '[\x1b[35mHMR\x1b[0m] ';

function createCompilationPromise(name, compiler, cfg) {
  return new Promise((resolve, reject) => {
    let timeStart = new Date();
    compiler.hooks.compile.tap(name, () => {
      timeStart = new Date();
      console.info(`[${format(timeStart)}] Compiling '${name}'...`);
    });

    compiler.hooks.done.tap(name, (stats) => {
      console.info(stats.toString(cfg.stats));
      const timeEnd = new Date();
      const time = timeEnd.getTime() - timeStart.getTime();
      if (stats.hasErrors()) {
        console.info(`[${format(timeEnd)}] Failed to compile '${name}' after ${time} ms`);
        reject(new Error('Compilation failed!'));
      } else {
        console.info(`[${format(timeEnd)}] Finished '${name}' compilation after ${time} ms`);
        resolve(stats);
      }
    });
  });
}

/**
 * Launches a development web server with "live reload" functionality -
 * synchronizing URLs, interactions and code changes across multiple devices.
 */
async function start(
  runDatabase = !process.argv.includes('--tdd-no-db') && !process.argv.includes('--tdd-no-docker'),
  persistDbData = !process.argv.includes('--tdd-no-db-persist'),
  noDocker = process.argv.includes('--tdd-no-docker'),
) {
  // initial build
  await run(yarn);
  await run(lint);
  await run(copy);
  await run(generateSrc);

  // Doesn't resolve until kill signal sent
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (outerResolve) => {
    const network = 'durak-tdd';

    let cleaning = null;
    let cfgWatcher = null;
    const cleanupAndExit = async () => {
      if (!cleaning) {
        cleaning = (async () => {
          buildLog('Process exiting... cleaning up...');
          cfgWatcher?.close();
          await dockerTeardown();
          buildLog('Cleanup finished.');
          outerResolve();
          // process.exit();
        })();
      }
      return cleaning;
    };
    onKillSignal(cleanupAndExit);

    try {
      if (!noDocker) {
        await dockerNetworkCreate(network);
      }
      if (runDatabase) {
        await fs.ensureDir('./db/data-tdd');
        const { port } = await runDbContainer(network, persistDbData && './db/data-tdd');
        process.env.DB_ENABLED = true;
        process.env.DB_HOST = `mongodb://localhost:${port}`;
      }

      const server = express();
      server.use(errorOverlayMiddleware());
      server.use(express.static(path.resolve(__dirname, '../public')));

      // Configure client-side hot module replacement
      const clientConfig = webpackConfig.find((cfg) => cfg.name === 'client');
      clientConfig.entry.client = ['./target/lib/webpackHotDevClient']
        .concat(clientConfig.entry.client)
        .sort((a, b) => b.includes('polyfill') - a.includes('polyfill'));
      clientConfig.output.filename = clientConfig.output.filename.replace('chunkhash', 'hash');
      clientConfig.output.chunkFilename = clientConfig.output.chunkFilename.replace(
        'chunkhash',
        'hash',
      );
      clientConfig.module.rules = clientConfig.module.rules.filter(
        (x) => x.loader !== 'null-loader',
      );
      clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

      // Configure server-side hot module replacement
      const serverConfig = webpackConfig.find((cfg) => cfg.name === 'server');
      serverConfig.output.hotUpdateMainFilename = 'updates/[hash].hot-update.json';
      serverConfig.output.hotUpdateChunkFilename = 'updates/[id].[hash].hot-update.js';
      serverConfig.module.rules = serverConfig.module.rules.filter(
        (x) => x.loader !== 'null-loader',
      );
      serverConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

      // Configure compilation
      await run(clean, false);
      const multiCompiler = webpack(webpackConfig);
      const clientCompiler = multiCompiler.compilers.find((compiler) => compiler.name === 'client');
      const serverCompiler = multiCompiler.compilers.find((compiler) => compiler.name === 'server');
      const clientPromise = createCompilationPromise('client', clientCompiler, clientConfig);
      const serverPromise = createCompilationPromise('server', serverCompiler, serverConfig);

      // https://github.com/webpack/webpack-dev-middleware
      server.use(
        webpackDevMiddleware(clientCompiler, {
          publicPath: clientConfig.output.publicPath,
          logLevel: 'silent',
          watchOptions,
        }),
      );

      // https://github.com/glenjamin/webpack-hot-middleware
      server.use(webpackHotMiddleware(clientCompiler, { log: false }));

      let appPromise;
      let appPromiseResolve;
      let appPromiseIsResolved = true;
      serverCompiler.hooks.compile.tap('server', () => {
        if (!appPromiseIsResolved) return;
        appPromiseIsResolved = false;
        // eslint-disable-next-line no-return-assign
        appPromise = new Promise((resolve) => {
          appPromiseResolve = resolve;
        });
      });

      let app = null;
      let destroy = null;
      server.use((req, res) => {
        appPromise.then(() => app.handle(req, res)).catch((error) => console.error(error));
      });

      const recreateApp = async () => {
        console.warn(`${hmrPrefix}Recreating the app...`);
        await destroy?.();
        delete require.cache[require.resolve('config')];
        delete require.cache[require.resolve('@murrayju/config')];
        delete require.cache[require.resolve('../build/server')];
        // eslint-disable-next-line global-require, import/no-unresolved, import/extensions
        ({ app, destroy } = await require('../build/server').default());
        console.warn(`${hmrPrefix}App has been reloaded.`);
      };

      // eslint-disable-next-line no-inner-declarations
      function checkForUpdate(fromUpdate) {
        if (!app.hot) {
          throw new Error(`${hmrPrefix}Hot Module Replacement is disabled.`);
        }
        if (app.hot.status() !== 'idle') {
          return Promise.resolve();
        }
        return app.hot
          .check(true)
          .then((updatedModules) => {
            if (!updatedModules) {
              if (fromUpdate) {
                console.info(`${hmrPrefix}Update applied.`);
              }
              return;
            }
            if (updatedModules.length === 0) {
              console.info(`${hmrPrefix}Nothing hot updated.`);
            } else {
              console.info(`${hmrPrefix}Updated modules:`);
              updatedModules.forEach((moduleId) => console.info(`${hmrPrefix} - ${moduleId}`));
              checkForUpdate(true);
            }
          })
          .catch(async (error) => {
            if (['abort', 'fail'].includes(app.hot.status())) {
              console.warn(`${hmrPrefix}Cannot apply update.`);
              await recreateApp();
            } else {
              console.warn(`${hmrPrefix}Update failed: ${error.stack || error.message}`);
            }
          });
      }

      serverCompiler.watch(watchOptions, (error, stats) => {
        if (app && !error && !stats.hasErrors()) {
          checkForUpdate().then(() => {
            appPromiseIsResolved = true;
            appPromiseResolve();
          });
        }
      });

      cfgWatcher = chokidar.watch(['./config/*.yml'], {
        ignoreInitial: true,
        ignored: /.*\._generated_\..*/,
        usePolling: process.argv.includes('--poll-fs'),
      });

      cfgWatcher.on('all', async (event, filePath) => {
        const src = path.relative('./', filePath);
        buildLog(`Detected ${event} to '${src}'`);
        await recreateApp();
      });

      // Wait until both client-side and server-side bundles are ready
      await clientPromise;
      await serverPromise;

      const timeStart = new Date();
      console.info(`[${format(timeStart)}] Launching server...`);

      // Load compiled src/server.js as a middleware
      // eslint-disable-next-line global-require, import/no-unresolved, import/extensions
      ({ app, destroy } = await require('../build/server').default());
      appPromiseIsResolved = true;
      appPromiseResolve();

      // Launch the development server with Browsersync and HMR
      await new Promise((resolve, reject) => {
        browserSync.create().init(
          {
            // https://www.browsersync.io/docs/options
            server: 'src/server.js',
            port: config.get('server.port'),
            middleware: [server],
            open: !process.argv.includes('--silent'),
            ghostMode: false,
            ...(isDebug ? {} : { notify: false, ui: false }),
          },
          (error, bs) => (error ? reject(error) : resolve(bs)),
        );
      });

      const timeEnd = new Date();
      const time = timeEnd.getTime() - timeStart.getTime();
      console.info(`[${format(timeEnd)}] Server launched after ${time} ms`);
    } catch (err) {
      buildLog(`Something in tdd threw an exception: ${err.toString()}`);
      console.error(err);
      await cleanupAndExit();
    }
  });
}

export default start;
