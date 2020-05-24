// @flow
import Card from './Card';
import type { SerializedCard, Suit } from './Card';
import Deck from './Deck';
import type { SerializedDeck } from './Deck';
import Player from './Player';
import type { SerializedPlayer } from './Player';
import type { Client } from './Table';

type Attack = {
  attack: Card,
  defense?: ?Card,
};

type SerializedAttack = [SerializedCard, SerializedCard] | [SerializedCard];
type TurnPhase = 'attack' | 'pickUp';

export type SerializedGameState = {
  turn: number,
  phase: TurnPhase,
  gameStarted: boolean,
  gameOver: boolean,
  players: SerializedPlayer[],
  deck: SerializedDeck,
  trumpCard: ?SerializedCard,
  trumpSuit: ?Suit,
  attacks: SerializedAttack[],
  discard: SerializedDeck,
  durak: ?string,
  beatVotes: string[],
  pickUpVotes: string[],
};

export type GameStateCtorData = {
  turn?: number,
  phase?: TurnPhase,
  gameStarted?: boolean,
  gameOver?: boolean,
  players?: Array<SerializedPlayer | Player>,
  deck?: SerializedDeck | Deck,
  trumpCard?: ?(SerializedCard | Card),
  trumpSuit?: ?Suit,
  attacks?: Array<SerializedAttack | Attack>,
  discard?: SerializedDeck | Deck,
  durak?: ?string,
  beatVotes?: ?(string[]),
  pickUpVotes?: ?(string[]),
};

export default class GameState {
  turn: number;
  phase: TurnPhase;
  gameStarted: boolean;
  gameOver: boolean;
  players: Player[];
  deck: Deck;
  trumpCard: ?Card;
  trumpSuit: ?Suit;
  attacks: Attack[];
  discard: Deck;
  durak: ?string;
  beatVotes: string[];
  pickUpVotes: string[];

  constructor({
    turn,
    phase,
    gameStarted,
    gameOver,
    players,
    deck,
    trumpCard,
    trumpSuit,
    attacks,
    discard,
    durak,
    beatVotes,
    pickUpVotes,
  }: GameStateCtorData = {}) {
    this.turn = turn || 0;
    this.gameStarted = gameStarted || false;
    this.gameOver = gameOver || false;
    this.players = players?.map((p) => (p instanceof Player ? p : Player.deserialize(p))) || [];
    this.deck = deck instanceof Deck ? deck : deck ? Deck.deserialize(deck) : new Deck();
    this.trumpCard =
      trumpCard instanceof Card ? trumpCard : trumpCard ? Card.deserialize(trumpCard) : null;
    this.trumpSuit = trumpSuit || this.trumpCard?.suit || null;
    // $FlowFixMe
    this.attacks = (attacks || []).map(([attack, defense]) => ({
      attack: attack instanceof Card ? attack : Card.deserialize(attack),
      defense: defense instanceof Card ? defense : defense ? Card.deserialize(defense) : null,
    }));
    this.discard =
      discard instanceof Deck ? discard : discard ? Deck.deserialize(discard) : new Deck([]);
    this.durak = durak || null;
    this.beatVotes = beatVotes || [];
    this.pickUpVotes = pickUpVotes || [];
    this.phase = phase || 'attack';
  }

  computeDerivedState() {
    const remainingPlayers = this.players.filter((p) => p.hand.size > 0);
    this.gameOver = this.deck.size === 0 && remainingPlayers.length === 1;
    this.durak = this.gameOver ? remainingPlayers[0].id : null;
    return this;
  }

  serialize(forPlayer: string, obscured?: boolean = false): SerializedGameState {
    this.computeDerivedState();
    const {
      turn,
      phase,
      gameStarted,
      gameOver,
      players,
      deck,
      trumpCard,
      trumpSuit,
      attacks,
      discard,
      durak,
      beatVotes,
      pickUpVotes,
    } = this;
    return {
      turn,
      phase,
      gameStarted,
      gameOver,
      players: players.map((p) => p.serialize(obscured && p.id !== forPlayer)),
      deck: deck.serialize(obscured),
      trumpCard: trumpCard?.serialize() || null,
      trumpSuit,
      attacks: attacks.map(({ attack, defense }) => [
        attack.serialize(),
        ...(defense ? [defense?.serialize()] : []),
      ]),
      discard: discard.serialize(obscured),
      durak,
      beatVotes,
      pickUpVotes,
    };
  }

  get winners(): Player[] {
    return this.players.filter((p) => p.out);
  }

  get activePlayers(): Player[] {
    return this.players.filter((p) => !p.out);
  }

  get numPlayers(): number {
    return this.players.length;
  }

  get numActivePlayers(): number {
    return this.activePlayers.length;
  }

  relativePlayer(offset: number, source?: number = this.turn, all?: boolean = false) {
    const players = all ? this.players : this.activePlayers;
    const num = players.length;
    return players[(source + num + offset) % num];
  }

  get defender(): Player {
    return this.relativePlayer(1);
  }

  get primaryAttacker(): Player {
    return this.activePlayers[this.turn];
  }

  get unbeatenAttacks(): Attack[] {
    return this.attacks.filter(({ defense }) => !defense);
  }

  get looksBeat(): boolean {
    return this.attacks.length > 0 && this.unbeatenAttacks.length === 0;
  }

  get remainingAttackSlots(): number {
    return Math.min(
      6 - this.attacks.length,
      this.phase === 'pickUp' ? Infinity : this.defender.hand.size - this.unbeatenAttacks.length,
    );
  }

  getPlayer(player: Player | Client | string, all?: boolean = false): ?Player {
    const players = all ? this.players : this.activePlayers;
    return players.find((p) => p.id === (player?.id || player)) || null;
  }

  isPlayer(player: Player | Client | string, all?: boolean): boolean {
    return !!this.getPlayer(player, all);
  }

  isDefender(player: Player | Client | string): boolean {
    return this.defender.equals(player);
  }

  isPrimaryAttacker(player: Player | Client | string): boolean {
    return this.primaryAttacker.equals(player);
  }

  isAttacker(player: Player | Client | string): boolean {
    return this.isPlayer(player) && !this.isDefender(player);
  }

  canAttack(player: Player | Client | string): boolean {
    return !this.isDefender(player) && !!this.getPlayer(player);
  }

  incrementTurn(skipOne: boolean = false): number {
    this.attacks = [];
    this.beatVotes = [];
    this.pickUpVotes = [];
    // draw cards starting with primary attacker, in reverse order
    Array.from({ length: this.numActivePlayers }).forEach((_, i) => {
      const player = this.relativePlayer(-i);
      // Try the deck first
      player.hand.bottomDeck(this.deck.draw(6 - player.hand.size));
      if (player.hand.size < 6 && this.trumpCard) {
        // grab the trump card last
        player.hand.bottomDeck(this.trumpCard);
        this.trumpCard = null;
      }
    });
    let outBeforeTurn = 0;
    if (!this.deck.size && !this.trumpCard) {
      // any players without cards now are out
      this.activePlayers.forEach((p, i) => {
        if (!p.hand.size) {
          // eslint-disable-next-line no-param-reassign
          p.out = true;
          if (i <= this.turn) {
            outBeforeTurn += 1;
          }
        }
      });
    }
    this.turn = (this.turn + (skipOne ? 2 : 1) - outBeforeTurn) % this.numActivePlayers;
    this.phase = 'attack';
    return this.turn;
  }

  static deserialize(data?: SerializedGameState) {
    return new GameState((data: any));
  }
}
