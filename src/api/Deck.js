// @flow
import Card from './Card';
import type { SerializedCard } from './Card';

const fullDeck: Card[] = Card.suits.flatMap(suit => Card.ranks.map(rank => new Card(rank, suit)));
const imageUrlMap = {
  ...fullDeck.reduce((obj, c) => Object.assign(obj, { [c.id]: c.imageUrl }), {}),
  back: Card.backImageUrl,
  [Card.obscured.id]: Card.backImageUrl,
};

export type SerializedDeck = SerializedCard[];

export default class Deck {
  cards: Card[];
  constructor(cards: Card[] = fullDeck) {
    this.cards = [...cards];
  }

  get size(): number {
    return this.cards.length;
  }

  shuffle() {
    this.cards.sort(() => Math.random() - 0.5);
    return this;
  }

  sort() {
    this.cards.sort((a, b) => {
      const suitCmp = a.compareSuit(b);
      return suitCmp === 0 ? a.compareRank(b) : suitCmp;
    });
    return this;
  }

  draw(count?: number = 1): Card[] {
    return this.cards.splice(-count, count).reverse();
  }

  topDeck(cards: Card | Card[]) {
    if (Array.isArray(cards)) {
      this.cards.push(...cards);
    } else {
      this.cards.push(cards);
    }
    return this;
  }

  bottomDeck(cards: Card | Card[]) {
    if (Array.isArray(cards)) {
      this.cards.unshift(...cards);
    } else {
      this.cards.unshift(cards);
    }
    return this;
  }

  serialize(obscured?: boolean = false): SerializedDeck {
    return this.cards.map(c => c.serialize(obscured));
  }

  static deserialize(deck: SerializedDeck): Deck {
    return new Deck(deck?.map(c => Card.deserialize(c)) || []);
  }

  static random(): Deck {
    return new Deck().shuffle();
  }

  static get imageUrlMap() {
    return imageUrlMap;
  }
}
