// @flow

export type Rank =
  | 'X'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A';
export type Suit = 'X' | 'C' | 'D' | 'H' | 'S';

const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const suits: Suit[] = ['D', 'C', 'H', 'S'];

export type SerializedCard = string;

export type SomeCards = Card | SerializedCard | Card[] | SerializedCard[];

export default class Card {
  rank: Rank;
  suit: Suit;

  constructor(rank: Rank, suit: Suit) {
    this.rank = rank;
    this.suit = suit;
  }

  get name(): string {
    return `${this.rank}${this.suit}`;
  }

  get id(): string {
    return `${this.rank}:${this.suit}`;
  }

  get imageUrl() {
    return this.id === unknownCard.id
      ? Card.backImageUrl
      : `/static/images/playingCards/${this.name}.svg`;
  }

  compareRank(other: Card) {
    return ranks.indexOf(this.rank) - ranks.indexOf(other?.rank);
  }

  compareSuit(other: Card) {
    return suits.indexOf(this.suit) - suits.indexOf(other?.suit);
  }

  equals(other: Card) {
    return other && this.id === other.id;
  }

  equalsRankOf(other: Card) {
    return other && this.rank === other.rank;
  }

  equalsSuitOf(other: Card) {
    return other && this.suit === other.suit;
  }

  beats(other: Card, trumpSuit?: ?Suit = null) {
    return (
      (this.equalsSuitOf(other) && this.compareRank(other) > 0) ||
      (trumpSuit && this.suit === trumpSuit && other.suit !== trumpSuit)
    );
  }

  serialize(obscured?: boolean = false): SerializedCard {
    return obscured ? unknownCard.id : this.id;
  }

  static deserialize(card: SerializedCard): Card {
    if (card === this.obscured.id) {
      return this.obscured;
    }
    const [rank, suit] = card?.split(':') || [];
    if (!(ranks.includes(rank) && suits.includes(suit))) {
      throw new Error(`Invalid card: ${card}`);
    }
    return new Card(((rank: any): Rank), ((suit: any): Suit));
  }

  static wrap(card: SerializedCard | Card): Card {
    return card instanceof Card ? card : this.deserialize(card);
  }

  static wrapMultiple(cards: SomeCards): Card[] {
    return (Array.isArray(cards) ? cards : [cards]).map((c) => this.wrap(c));
  }

  static get ranks(): Rank[] {
    return ranks;
  }

  static get suits(): Suit[] {
    return suits;
  }

  static get obscured(): Card {
    return unknownCard;
  }

  static get backImageUrl() {
    return `/static/images/playingCards/back_red.svg`;
  }
}

const unknownCard = new Card('X', 'X');
