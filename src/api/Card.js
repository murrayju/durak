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
    return this.id === 'X:X' ? Card.backImageUrl : `/static/images/playingCards/${this.name}.svg`;
  }

  compareRank(other: Card) {
    return ranks.indexOf(this.rank) - ranks.indexOf(other.rank);
  }

  compareSuit(other: Card) {
    return suits.indexOf(this.suit) - suits.indexOf(other.suit);
  }

  serialize(obscured?: boolean = false): SerializedCard {
    return obscured ? 'X:X' : this.id;
  }

  static deserialize(card: SerializedCard) {
    const [rank, suit] = card.split(':');
    return new Card(((rank: any): Rank), ((suit: any): Suit));
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
