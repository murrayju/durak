// @flow
import Deck from './Deck';
import type { SerializedDeck } from './Deck';
import type { Client } from './Table';

export type SerializedPlayer = {
  id: string,
  name: string,
  hand: SerializedDeck,
  out?: boolean,
};

type PlayerCtorData = {
  id: string,
  name: string,
  hand: SerializedDeck | Deck,
  out?: boolean,
};

export default class Player {
  id: string;
  name: string;
  hand: Deck;
  out: boolean;

  constructor({ id, name, hand, out }: PlayerCtorData) {
    this.id = id;
    this.name = name;
    this.hand = hand instanceof Deck ? hand : Deck.deserialize(hand);
    this.out = out || false;
  }

  serialize(obscured?: boolean = false): SerializedPlayer {
    const { id, name, hand, out } = this;
    return {
      id,
      name,
      hand: hand.serialize(obscured),
      ...(out ? { out } : null),
    };
  }

  equals(other: Player | Client | string) {
    return this.id === (other.id || other);
  }

  static deserialize(data: SerializedPlayer) {
    return new Player((data: any));
  }
}
