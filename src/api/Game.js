// @flow
import path from 'path';
import { v4 as uuid } from 'uuid';
import fs from 'fs-extra';
import SseChannel from 'sse-channel';
import type { $Request, $Response } from 'express';

import logger from '../logger';
import WordList from './WordList';
import { whiteBlackFilter } from '../util/array';
import type { ApiRequestContext } from './index';

const imagesRoot = path.resolve(
  __dirname,
  process.env.NODE_ENV === 'production' ? './' : '../',
  'public/static/images',
);
const imageUrlRoot = '/static/images';
const listImagesRandomly = async (subDir: string) =>
  (await fs.readdir(path.resolve(imagesRoot, subDir))).sort(() => Math.random() - 0.5);
const getImages = async (key: TileType[]) => {
  const img = {
    red: await listImagesRandomly('red'),
    blue: await listImagesRandomly('blue'),
    assassin: await listImagesRandomly('assassin'),
    bystander: await listImagesRandomly('bystander'),
    unknown: [],
  };
  return key.map(k => `${imageUrlRoot}/${k}/${img[k].splice(0, 1)[0]}`);
};

type Team = 'red' | 'blue';
export type TileType = Team | 'assassin' | 'bystander' | 'unknown';

export type GameState = {
  turn?: Team,
  key?: ?(TileType[]),
  revealTileImages?: ?(string[]),
  words?: string[],
  revealed?: boolean[],
};

export type Role = 'spymaster' | 'operative';

export type Player = {
  id: string,
  name: string,
  role: Role,
  team: Team,
};

export type GameDbData = {
  id: string,
  wordListId?: string,
  state?: GameState,
  players?: Player[],
};

type NewGameOptions = {
  wordListId?: string,
};

const gamesCache = new Map<string, Game>();

export default class Game {
  #data: GameDbData;
  #wordList: ?WordList;
  _sse: SseChannel;
  _sseClients: Map<string, Set<$Response>>;
  _sseConnections: WeakMap<$Response, string>;

  constructor(data: GameDbData) {
    this.#data = data;
    this._sseClients = new Map();
    this._sseConnections = new WeakMap();
    this._sse = new SseChannel({ jsonEncode: true })
      .on('connect', (channel, req, res) => {
        const { clientId } = req.ctx;
        logger.info(`Client connected to SSE stream.`, { clientId });
        if (!this._sseClients.has(clientId)) {
          this._sseClients.set(clientId, new Set());
        }
        this._sseClients.get(clientId)?.add(res);
        this._sseConnections.set(res, clientId);
      })
      .on('disconnect', (channel, res) => {
        const clientId = this._sseConnections.get(res);
        logger.info(`Client disconnected from SSE stream.`, {
          clientId,
        });
        this._sseConnections.delete(res);
        if (clientId) {
          this._sseClients.get(clientId)?.delete(res);
          if (this._sseClients.get(clientId)?.size === 0) {
            this._sseClients.delete(clientId);
          }
          if (this._sseClients.size === 0) {
            logger.info('All clients disconnected');
          }
        }
      });
  }

  get id() {
    return this.#data.id;
  }

  get wordListId(): string {
    return this.#data.wordListId || 'standard';
  }

  get players(): Player[] {
    return this.#data.players || [];
  }

  async getWordList(): Promise<WordList> {
    if (!this.#wordList) {
      this.#wordList = await WordList.get(this.wordListId);
    }
    return this.#wordList;
  }

  get state(): GameState {
    if (!this.#data.state) {
      this.#data.state = {};
    }
    return this.#data.state;
  }

  async serialize(): Promise<GameDbData> {
    const { id, state, wordListId, players } = this;
    return { id, state, wordListId, players };
  }

  async newWords(): Promise<string[]> {
    this.state.words = (await this.getWordList()).getRandomList(25);
    return this.state.words;
  }

  async newKey(): Promise<TileType[]> {
    const first = Math.random() > 0.5 ? 'red' : 'blue';
    this.state.turn = first;
    const key = [
      ...['red', 'blue'].flatMap(c => Array.from({ length: first === c ? 9 : 8 }).map(() => c)),
      ...Array.from({ length: 7 }).map(() => 'bystander'),
      'assassin',
    ].sort(() => Math.random() - 0.5);
    this.state.key = key;
    this.state.revealTileImages = await getImages(key);
    return key;
  }

  async newRound() {
    this.#data.state = {};
    this.state.revealed = Array.from({ length: 25 }).map(() => false);
    await this.newWords();
    await this.newKey();
  }

  async delete() {
    this.emitToSseClients('connectionClosing');
    this._sse.close();
    this._sseClients.clear();
    this._sseConnections = new WeakMap();
    gamesCache.delete(this.id);
  }

  async connectSseClient(req: $Request, res: $Response): Promise<void> {
    await new Promise((resolve, reject) =>
      this._sse.addClient(req, res, err => (err ? reject(err) : resolve())),
    );
    this._sse.send({ id: uuid(), event: 'connected' }, [res]);
  }

  emitToSseClients(
    event: string,
    data?: ?{ [string]: any } = null,
    clientWhiteList?: ?(string[]) = null,
    clientBlackList?: ?(string[]) = null,
  ): void {
    const clients =
      clientWhiteList || clientBlackList
        ? whiteBlackFilter(
            [...this._sseClients.keys()],
            clientWhiteList,
            clientBlackList,
          ).flatMap(k => [...(this._sseClients.get(k) || [])])
        : null;
    const count = clients ? clients.length : this._sse.getConnectionCount();
    this._sse.send(
      {
        id: data?.id || uuid(),
        event,
        data,
      },
      // if sending to all clients, use null
      count === this._sse.getConnectionCount() ? null : clients,
    );
    logger.debug(`emitted '${event}' event to ${count} client(s) via SSE`, {
      event,
      data,
    });
  }

  async save(ctx: ApiRequestContext) {
    await this.emitToSseClients('stateChanged', await this.serialize());
  }

  async joinPlayer(ctx: ApiRequestContext, player: Player) {
    this.#data.players = [...this.players, player];
    await this.save(ctx);
  }

  async selectTile(ctx: ApiRequestContext, index: number) {
    if (!this.state.revealed || index >= this.state.revealed.length) {
      throw new Error('Invalid tile index');
    }
    this.state.revealed[index] = true;
    await this.save(ctx);
  }

  static async find(ctx: ApiRequestContext, id: string): Promise<?Game> {
    // const game: ?GameDbData = await ctx.serverContext.db.collection('games').findOne({ id });
    // if (!game) {
    //   return null;
    // }
    // return new Game(game);
    return gamesCache.get(id) || null;
  }

  static async get(ctx: ApiRequestContext, id: string): Promise<?Game> {
    const game = await this.find(ctx, id);
    if (!game) {
      throw new Error(`No game found with id '${id}'`);
    }
    return game;
  }

  static async newUniqueId(ctx: ApiRequestContext) {
    const wl = await WordList.get('standard');
    let id = null;
    let attempts = 10;
    /* eslint-disable no-await-in-loop */
    while (wl && attempts > 0) {
      id = wl.getRandomId(3);
      if (!(await this.find(ctx, id))) {
        return id;
      }
      attempts -= 1;
    }
    /* eslint-enable no-await-in-loop */
    return uuid();
  }

  static async create(ctx: ApiRequestContext, { wordListId }: NewGameOptions = {}) {
    const id = await this.newUniqueId(ctx);
    const game = new Game({ id, wordListId });
    await game.newRound();
    gamesCache.set(id, game);
    return game;
  }
}
