// @flow
import config from '@murrayju/config';
import { v4 as uuid } from 'uuid';
import camelCase from 'camelcase';
import { without, union } from 'lodash';

import { entries } from '../util/maps';

type WordListDbData = {
  id: string,
  name?: string,
  list: string[],
};

type WordListDbDataMap = {
  [id: string]: WordListDbData,
};

type WordListMap = {
  [id: string]: WordList,
};

export default class WordList {
  #data: WordListDbData;

  constructor({ id, ...data }: WordListDbData) {
    this.#data = {
      ...data,
      id: id || uuid(),
    };
  }

  get id(): string {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name || '';
  }

  get list(): string[] {
    return this.#data.list || [];
  }

  get size(): number {
    return this.list.length || 0;
  }

  getRandomList(count: number = 25) {
    if (count > this.size) {
      throw new Error('List too small');
    }
    return Array.from({ length: this.size })
      .map((v, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map(i => this.list[i]);
  }

  getRandomId(wordCount: number = 4): string {
    return camelCase(this.getRandomList(wordCount));
  }

  joinWith(words?: ?(WordList | string[])): WordList {
    return new WordList({
      id: uuid(),
      list: union(this.list, (words instanceof WordList ? words.list : words) || []),
    });
  }

  without(words?: ?(WordList | string[])): WordList {
    return new WordList({
      id: uuid(),
      list: without(this.list, ...((words instanceof WordList ? words.list : words) || [])),
    });
  }

  static async getMap(): Promise<WordListMap> {
    return (await this.getAll()).reduce(
      (obj, w) =>
        Object.assign(obj, {
          [w.id]: w,
        }),
      {},
    );
  }

  static async getAll(): Promise<WordList[]> {
    return entries((config.get('words'): WordListDbDataMap)).map(
      ([id, value]) => new this({ id, ...value }),
    );
  }

  static async find(id: string): Promise<?WordList> {
    return (await this.getMap())[id] || null;
  }

  static async get(id: string): Promise<WordList> {
    const list = await this.find(id);
    if (!list) {
      throw new Error(`Failed to find WordList with id '${id}'`);
    }
    return list;
  }
}
