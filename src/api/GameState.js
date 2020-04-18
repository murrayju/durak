// @flow
import Card from './Card';
import type { SerializedCard } from './Card';
import Deck from './Deck';
import type { SerializedDeck } from './Deck';
import Player from './Player';
import type { SerializedPlayer } from './Player';

type Attack = {
  attack: Card,
  defense?: ?Card,
};

type SerializedAttack = {
  attack: SerializedCard,
  defense?: ?SerializedCard,
};

export type SerializedGameState = {
  turn: number,
  gameStarted: boolean,
  gameOver: boolean,
  players: SerializedPlayer[],
  deck: SerializedDeck,
  trumpCard: ?SerializedCard,
  attacks: SerializedAttack[],
  discard: SerializedDeck,
  durak: ?string,
};

export type GameStateCtorData = {
  turn?: number,
  gameStarted?: boolean,
  gameOver?: boolean,
  players?: Array<SerializedPlayer | Player>,
  deck?: SerializedDeck | Deck,
  trumpCard?: ?(SerializedCard | Card),
  attacks?: Array<SerializedAttack | Attack>,
  discard?: SerializedDeck | Deck,
  durak?: ?string,
};

export default class GameState {
  turn: number;
  gameStarted: boolean;
  gameOver: boolean;
  players: Player[];
  deck: Deck;
  trumpCard: ?Card;
  attacks: Attack[];
  discard: Deck;
  durak: ?string;

  constructor({
    turn,
    gameStarted,
    gameOver,
    players,
    deck,
    trumpCard,
    attacks,
    discard,
    durak,
  }: GameStateCtorData = {}) {
    this.turn = turn || 0;
    this.gameStarted = gameStarted || false;
    this.gameOver = gameOver || false;
    this.players = players?.map((p) => (p instanceof Player ? p : Player.deserialize(p))) || [];
    this.deck = deck instanceof Deck ? deck : deck ? Deck.deserialize(deck) : new Deck();
    this.trumpCard =
      trumpCard instanceof Card ? trumpCard : trumpCard ? Card.deserialize(trumpCard) : null;
    this.attacks = (attacks || []).map(({ attack, defense } = {}) => ({
      attack: attack instanceof Card ? attack : Card.deserialize(attack),
      defense: defense instanceof Card ? defense : defense ? Card.deserialize(defense) : null,
    }));
    this.discard =
      discard instanceof Deck ? discard : discard ? Deck.deserialize(discard) : new Deck([]);
    this.durak = durak || null;
  }

  computeDerivedState() {
    const remainingPlayers = this.players.filter((p) => p.hand.size > 0);
    this.gameOver = this.deck.size === 0 && remainingPlayers.length === 1;
    this.durak = this.gameOver ? remainingPlayers[0].id : null;
    return this;
  }

  serialize(forPlayer: string, obscured?: boolean = false): SerializedGameState {
    this.computeDerivedState();
    const { turn, gameStarted, gameOver, players, deck, trumpCard, attacks, discard, durak } = this;
    return {
      turn,
      gameStarted,
      gameOver,
      players: players.map((p) => p.serialize(obscured && p.id !== forPlayer)),
      deck: deck.serialize(obscured),
      trumpCard: trumpCard?.serialize() || null,
      attacks: attacks.map(({ attack, defense }) => ({
        attack: attack.serialize(),
        defense: defense?.serialize() || null,
      })),
      discard: discard.serialize(obscured),
      durak,
    };
  }

  relativePlayer(offset: number, source?: number = this.turn) {
    const num = this.players.length;
    return this.players[(source + num + offset) % num];
  }

  static deserialize(data?: SerializedGameState) {
    return new GameState((data: any));
  }
}
