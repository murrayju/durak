// @flow
import Card from './Card';
import type { SerializedCard, SomeCards, Suit } from './Card';

const standardCards = (): Card[] => {
  const { suits, ranks } = Card;
  const nSuits = suits.length;
  const nRanks = ranks.length;
  const randomIds = Array.from({ length: nSuits * nRanks })
    .map((_, i) => `${i}`)
    .sort(() => Math.random() - 0.5);
  return suits.flatMap((suit, s) =>
    ranks.map((rank, r) => new Card(rank, suit, randomIds[s * nRanks + r])),
  );
};
const imageUrlMap = {
  ...standardCards().reduce((obj, c) => Object.assign(obj, { [c.id]: c.imageUrl }), {}),
  back: Card.backImageUrl,
};

export type SerializedDeck = SerializedCard[];

export default class Deck {
  cards: Card[];
  constructor(cards: Card[] = standardCards()) {
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

  // Take card(s) from the top of the deck
  draw(count?: number = 1): Card[] {
    return this.cards.splice(-count, count).reverse();
  }

  // Ignores cards not in deck
  // returns cards actually removed
  remove(cards: SomeCards): Card[] {
    return Card.wrapMultiple(cards).reduce((removed, card) => {
      const i = this.cards.findIndex((c) => c.equals(card));
      if (i >= 0) {
        const [removedCard] = this.cards.splice(i, 1);
        removed.push(removedCard);
      }
      return removed;
    }, []);
  }

  topDeck(cards: SomeCards) {
    this.cards.push(...Card.wrapMultiple(cards));
    return this;
  }

  bottomDeck(cards: SomeCards) {
    this.cards.unshift(...Card.wrapMultiple(cards));
    return this;
  }

  contains(cards: SomeCards): boolean {
    return Card.wrapMultiple(cards).every((card) => this.cards.find((c) => c.equals(card)));
  }

  serialize(obscured?: boolean = false): SerializedDeck {
    return this.cards.map((c) => c.serialize(obscured));
  }

  lowest(suit?: ?Suit): ?Card {
    return (
      [...this.cards].filter((c) => !suit || c.suit === suit).sort((a, b) => a.compareRank(b))[0] ||
      null
    );
  }

  static deserialize(deck: SerializedDeck): Deck {
    return new Deck(deck?.map((c) => Card.deserialize(c)) || []);
  }

  static random(): Deck {
    return new Deck().shuffle();
  }

  static get imageUrlMap() {
    return imageUrlMap;
  }
}
