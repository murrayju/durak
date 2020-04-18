// @flow
import Deck from './Deck';
import type { SerializedDeck } from './Deck';
import type { Client } from './Game';

export type SerializedPlayer = {
  id: string,
  name: string,
  hand: SerializedDeck,
};

type PlayerCtorData = {
  id: string,
  name: string,
  hand: SerializedDeck | Deck,
};

export default class Player {
  id: string;
  name: string;
  hand: Deck;

  constructor({ id, name, hand }: PlayerCtorData) {
    this.id = id;
    this.name = name;
    this.hand = hand instanceof Deck ? hand : Deck.deserialize(hand);
  }

  serialize(obscured?: boolean = false): SerializedPlayer {
    const { id, name, hand } = this;
    return {
      id,
      name,
      hand: hand.serialize(obscured),
    };
  }

  equals(other: Player | Client | string) {
    return this.id === (other.id || other);
  }

  static deserialize(data: SerializedPlayer) {
    return new Player((data: any));
  }
}
