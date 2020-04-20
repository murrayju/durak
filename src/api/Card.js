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
const suitChars = ['♦', '♣', '♥', '♠'];
const suitNames = ['Diamonds', 'Clubs', 'Hearts', 'Spades'];

export type SerializedCard = string;

export type SomeCards = Card | SerializedCard | Card[] | SerializedCard[];

export default class Card {
  rank: Rank;
  suit: Suit;
  idNum: string;

  constructor(rank: Rank, suit: Suit, idNum: string) {
    this.rank = rank;
    this.suit = suit;
    this.idNum = idNum;
  }

  get name(): string {
    return `${this.rank}${this.suit}`;
  }

  get id(): string {
    return `${this.rank}:${this.suit}:${this.idNum}`;
  }

  get obscuredId(): string {
    return `X:X:${this.idNum}`;
  }

  get isObscured() {
    return this.rank === 'X' || this.suit === 'X';
  }

  get imageUrl() {
    return this.isObscured ? Card.backImageUrl : `/static/images/playingCards/${this.name}.svg`;
  }

  get symbol(): string {
    return suitChars[suits.indexOf(this.suit)] || '';
  }

  get suitName(): string {
    return suitNames[suits.indexOf(this.suit)] || '';
  }

  compareRank(other: Card) {
    return ranks.indexOf(this.rank) - ranks.indexOf(other?.rank);
  }

  compareSuit(other: Card) {
    return suits.indexOf(this.suit) - suits.indexOf(other?.suit);
  }

  equals(other: Card) {
    return this.equalsRankOf(other) && this.equalsSuitOf(other);
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
    return obscured ? this.obscuredId : this.id;
  }

  static deserialize(card: SerializedCard): Card {
    const [rank, suit, idNum] = card?.split(':') || [];
    if (!(ranks.includes(rank) && suits.includes(suit)) && !(rank === 'X' && suit === 'X')) {
      throw new Error(`Invalid card: ${card}`);
    }
    return new Card(((rank: any): Rank), ((suit: any): Suit), idNum);
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
    return new Card('X', 'X', 'X');
  }

  static get backImageUrl() {
    return `/static/images/playingCards/back_red.svg`;
  }
}
