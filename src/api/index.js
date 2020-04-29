// @flow
import Router from 'express-promise-router';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { v4 as uuid } from 'uuid';

// $FlowFixMe - generated file
import { version } from '../version._generated_'; // eslint-disable-line import/no-unresolved
import logger from '../logger';
import type { ServerContext } from '../server';
import Table from './Table';
import Deck from './Deck';

export type ApiRequestContext = {
  correlationId: string,
  clientId: string,
  serverContext: ServerContext,
};

export type Request = {
  body: any,
  params: { [string]: string },
  query: { [string]: string },
};

export type ApiRequest = {
  ...Request,
  ctx: ApiRequestContext,
};

export type TableApiRequest = {
  ...Request,
  ctx: {
    ...ApiRequestContext,
    table: Table,
  },
};

// Middleware factory
export default function (serverContext: ServerContext) {
  const router = Router();

  router.use(cors());
  router.use(cookieParser());
  // all requests get a correlationId and clientId
  router.use(async (req, res, next) => {
    // use a cookie to identify clients
    const clientId = req.cookies.clientId || uuid();
    res.cookie('clientId', clientId);
    // namespace all extra parameters under req.ctx (more get added later)
    req.ctx = {
      correlationId: uuid(),
      clientId,
      serverContext,
    };
    res.ctx = {};
    next();
  });

  router.get('/', async (req, res) => {
    res.json({ ready: true });
  });

  router.get('/version', async (req, res) => {
    res.json(version);
  });

  router.get('/deck/imgMap', async (req, res) => {
    res.json(Deck.imageUrlMap);
  });

  router.post('/table', async (req: ApiRequest, res) => {
    const table = await Table.create(req.ctx);
    return res.json(await table.serialize());
  });

  router.use('/table/:id', async (req: TableApiRequest, res, next) => {
    const table = await Table.find(req.ctx, req.params.id);
    if (!table) {
      return res.status(404).send('Not found');
    }
    req.ctx.table = table;
    return next();
  });

  router.get('/table/:id', async (req: TableApiRequest, res) => {
    const {
      ctx: { table, clientId },
    } = req;
    return res.json(await table.serialize(clientId));
  });

  router.get('/table/:id/events', async (req: TableApiRequest, res) => {
    const {
      ctx: { table },
    } = req;
    return table.connectSseClient(req, res);
  });

  router.post('/table/:id/join', async (req: TableApiRequest, res) => {
    const {
      body,
      ctx: { table, clientId },
    } = req;
    const player = {
      ...body,
      id: clientId,
    };
    await table.joinClient(req.ctx, player);
    return res.status(204).send();
  });

  router.post('/table/:id/newRound', async (req: TableApiRequest, res) => {
    const {
      ctx: { table },
    } = req;
    await table.startNewRound(req.ctx);
    return res.status(204).send();
  });

  router.post('/table/:id/playCards', async (req: TableApiRequest, res) => {
    const {
      ctx: { table },
      body,
    } = req;
    await table.playCards(req.ctx, body);
    return res.status(204).send();
  });

  router.post('/table/:id/pickUpAttacks', async (req: TableApiRequest, res) => {
    const {
      ctx: { table },
    } = req;
    await table.pickUpAttacks(req.ctx);
    return res.status(204).send();
  });

  router.post('/table/:id/declareDoneAttacking', async (req: TableApiRequest, res) => {
    const {
      ctx: { table },
    } = req;
    await table.declareDoneAttacking(req.ctx);
    return res.status(204).send();
  });

  router.post('/table/:id/declareAsBeat', async (req: TableApiRequest, res) => {
    const {
      ctx: { table },
    } = req;
    await table.declareAsBeat(req.ctx);
    return res.status(204).send();
  });

  // Custom error handler
  router.use(
    (
      err: Error & { statusCode?: number },
      req,
      res,
      // eslint-disable-next-line no-unused-vars
      next,
    ) => {
      const statusCode: number =
        (typeof err.statusCode === 'number' ? err.statusCode : parseInt(err.statusCode, 10)) || 500;
      logger.debug(`Exception caught in top level express error handler: ${err.message}`);
      let logLevel = 'info';
      if (statusCode === 401) {
        // auth failures aren't a real problem
        logLevel = 'debug';
      } else if (statusCode >= 500) {
        // 500 errors represent an internal server error
        logLevel = 'error';
      }
      logger.log(logLevel, err.toString(), err);
      const { message } = err;
      return res.status(statusCode).json({ message });
    },
  );

  return router;
}
