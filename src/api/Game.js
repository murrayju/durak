// @flow
import path from 'path';
import { v4 as uuid } from 'uuid';
import fs from 'fs-extra';

import WordList from './WordList';
import type { ApiRequestContext } from './index';

const imagesRoot = path.resolve(__dirname, '../public/static/images');
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

export type GameDbData = {
  id: string,
  wordListId?: string,
  state?: GameState,
};

type NewGameOptions = {
  wordListId?: string,
};

const gamesCache = new Map<string, Game>();

export default class Game {
  #data: GameDbData;
  #wordList: ?WordList;

  constructor(data: GameDbData) {
    this.#data = data;
  }

  get id() {
    return this.#data.id;
  }

  get wordListId(): string {
    return this.#data.wordListId || 'standard';
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
    const { id, state, wordListId } = this;
    return { id, state, wordListId };
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
    this.state.revealed = Array.from({ length: 25 }).map(() => Math.random() > 0.5);
    await this.newWords();
    await this.newKey();
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
      id = wl.getRandomId();
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
