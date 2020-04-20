// @flow
import config from '@murrayju/config';
import { v4 as uuid } from 'uuid';
import SseChannel from 'sse-channel';
import type { $Request, $Response } from 'express';

import logger from '../logger';
import WordList from './WordList';
import { whiteBlackFilter } from '../util/array';
import type { ApiRequestContext } from './index';
import Deck from './Deck';
import Card from './Card';
import type { SerializedCard } from './Card';
import Player from './Player';
import GameState from './GameState';
import type { SerializedGameState } from './GameState';

const fakePlayers = config.get('fakePlayers') || [];

export type Client = {
  id: string,
  name: string,
};

export type SerializedGame = {
  id: string,
  clients?: Client[],
  state?: SerializedGameState,
};

export type CardPlay = {
  id: string,
  target?: string,
};

export type PlayAction = {
  type: 'attack' | 'defend',
  cards: CardPlay[],
};

const gamesCache = new Map<string, Game>();

export default class Game {
  id: string;
  clients: Client[];
  state: GameState;
  _sse: SseChannel;
  _sseClients: Map<string, Set<$Response>>;
  _sseConnections: WeakMap<$Response, string>;

  constructor({ id, clients, state }: SerializedGame) {
    this.id = id;
    this.clients = clients || [];
    this.state = state instanceof GameState ? state : GameState.deserialize(state);
    this._sseClients = new Map();
    this._sseConnections = new WeakMap();
    this._sse = new SseChannel({ jsonEncode: true })
      .on('connect', (channel, req, res) => {
        const { clientId } = req.ctx;
        logger.info(`Client connected to SSE stream.`, { clientId });
        if (!this._sseClients.has(clientId)) {
          this._sseClients.set(clientId, new Set());
        }
        this._sseClients.get(clientId)?.add(res);
        this._sseConnections.set(res, clientId);
      })
      .on('disconnect', (channel, res) => {
        const clientId = this._sseConnections.get(res);
        logger.info(`Client disconnected from SSE stream.`, {
          clientId,
        });
        this._sseConnections.delete(res);
        if (clientId) {
          this._sseClients.get(clientId)?.delete(res);
          if (this._sseClients.get(clientId)?.size === 0) {
            this._sseClients.delete(clientId);
          }
          if (this._sseClients.size === 0) {
            logger.info('All clients disconnected');
          }
        }
      });
  }

  async serialize(forPlayer: string, explicitlyObscured?: boolean): Promise<SerializedGame> {
    const { id, clients, state } = this;
    const obscured =
      explicitlyObscured == null
        ? !!state.players.find((p) => p.id === forPlayer)
        : explicitlyObscured;
    return { id, clients, state: state.serialize(forPlayer, obscured) };
  }

  async newRound() {
    const deck = Deck.random();

    // randomly seat the players, and deal initial hands to players
    const players = [...this.clients, ...fakePlayers]
      .sort(() => Math.random() - 0.5)
      .map(
        (c) =>
          new Player({
            ...c,
            hand: new Deck(deck.draw(6)).sort(),
          }),
      );

    // pick a trump
    const [trumpCard] = deck.draw(1);

    // lowest trump goes first
    const turn =
      players
        .map((p, i) => ({ lowestTrump: p.hand.lowest(trumpCard?.suit), i }))
        .filter((f) => !!f.lowestTrump)
        .sort((a, b) => a.lowestTrump.compareRank(b.lowestTrump))
        .map(({ i }) => i)[0] || 0;

    // really just for debugging right now, removes some random cards
    const deckSize = config.get('deckSize');
    const discard = new Deck(
      deckSize != null && deckSize < deck.size ? deck.draw(deck.size - deckSize) : [],
    );

    // set the initial game state
    this.state = new GameState({ deck, discard, players, turn, trumpCard });
  }

  async delete() {
    this.emitToSseClients('connectionClosing');
    this._sse.close();
    this._sseClients.clear();
    this._sseConnections = new WeakMap();
    gamesCache.delete(this.id);
  }

  async connectSseClient(req: $Request, res: $Response): Promise<void> {
    await new Promise((resolve, reject) =>
      this._sse.addClient(req, res, (err) => (err ? reject(err) : resolve())),
    );
    this._sse.send({ id: uuid(), event: 'connected' }, [res]);
  }

  emitToSseClients(
    event: string,
    data?: ?{ [string]: any } = null,
    clientWhiteList?: ?(string[]) = null,
    clientBlackList?: ?(string[]) = null,
  ): void {
    const clients =
      clientWhiteList || clientBlackList
        ? whiteBlackFilter(
            [...this._sseClients.keys()],
            clientWhiteList,
            clientBlackList,
          ).flatMap((k) => [...(this._sseClients.get(k) || [])])
        : null;
    const count = clients ? clients.length : this._sse.getConnectionCount();
    this._sse.send(
      {
        id: data?.id || uuid(),
        event,
        data,
      },
      // if sending to all clients, use null
      count === this._sse.getConnectionCount() ? null : clients,
    );
    logger.debug(`emitted '${event}' event to ${count} client(s) via SSE`, {
      event,
      data,
    });
  }

  async emitObscuredStateToEachPlayer() {
    const clients = [...this._sseClients.keys()];
    await Promise.all(
      clients.map(async (c) => this.emitToSseClients('stateChanged', await this.serialize(c), [c])),
    );
  }

  async save(ctx: ApiRequestContext) {
    await this.emitObscuredStateToEachPlayer();
    try {
      await ctx.serverContext.db
        .collection('games')
        .replaceOne({ id: this.id }, await this.serialize('server', false), { upsert: true });
    } catch (err) {
      logger.error('Failed to save to db', { err });
    }
  }

  async startNewRound(ctx: ApiRequestContext) {
    await this.newRound();
    this.state.gameStarted = true;
    await this.save(ctx);
  }

  async joinClient(ctx: ApiRequestContext, player: Client) {
    if (!this.clients.find((c) => c.id === player.id)) {
      this.clients.push(player);
    }
    await this.save(ctx);
  }

  isValidAttack(attackCard: Card | SerializedCard): boolean {
    const card = Card.wrap(attackCard);
    return (
      this.state.attacks.length === 0 ||
      (this.state.remainingAttackSlots > 0 &&
        !!this.state.attacks.find(
          ({ attack, defense }) => attack.equalsRankOf(card) || defense?.equalsRankOf(card),
        ))
    );
  }

  ensurePlayerCanPlay(ctx: ApiRequestContext): Player {
    const player = this.state.getPlayer(ctx.clientId);
    if (!player) {
      throw new Error(`You are not a player in the game, you can't play cards.`);
    }
    if (!this.state.gameStarted) {
      throw new Error(`The game hasn't started yet.`);
    }
    if (this.state.gameOver) {
      throw new Error(`The game is over.`);
    }
    return player;
  }

  async playCards(ctx: ApiRequestContext, play: PlayAction) {
    const player = this.ensurePlayerCanPlay(ctx);
    if (!play?.cards?.length) {
      // No-op
      return;
    }

    const cards = play.cards.map((c) => Card.deserialize(c.id));
    if (!player.hand.contains(cards)) {
      throw new Error(`You can't play a card that's not in your hand.`);
    }
    try {
      if (play.type === 'attack') {
        if (!this.state.canAttack(player)) {
          throw new Error(`You are not an attacker.`);
        }
        cards.forEach((c) => {
          if (!this.isValidAttack(c)) {
            throw new Error(`Invalid attack`);
          }
          const [attack] = player.hand.remove(c);
          this.state.attacks.push({
            attack,
          });
        });
      } else if (play.type === 'defend') {
        if (!this.state.isDefender(player)) {
          throw new Error(`You are not the defender.`);
        }
        cards.forEach((card, i) => {
          const { target } = play.cards[i];
          if (!target) {
            throw new Error(`Defensive play must have a target card.`);
          }
          const targetCard = Card.deserialize(target);
          const targetAttack = this.state.attacks.find(
            ({ attack, defense }) => attack.equals(targetCard) && !defense,
          );
          if (!targetAttack) {
            throw new Error(`No matching target card.`);
          }
          if (!card.beats(targetAttack.attack, this.state.trumpSuit)) {
            throw new Error(`Invalid target for defense.`);
          }
          const [defense] = player.hand.remove(card);
          targetAttack.defense = defense;
        });
      } else {
        throw new Error(`Invalid play type.`);
      }
    } finally {
      // Even if we threw above, may have modified some game state first
      this.state.beatVotes = [];
      await this.save(ctx);
    }
  }

  async pickUpAttacks(ctx: ApiRequestContext) {
    const player = this.ensurePlayerCanPlay(ctx);
    if (!this.state.isDefender(player)) {
      throw new Error(`You are not the defender.`);
    }

    player.hand.bottomDeck(
      this.state.attacks.flatMap(({ attack, defense }) => [attack, ...(defense ? [defense] : [])]),
    );
    this.state.incrementTurn(true);
    await this.save(ctx);
  }

  async declareAsBeat(ctx: ApiRequestContext) {
    const player = this.ensurePlayerCanPlay(ctx);
    if (!this.state.looksBeat) {
      throw new Error(`Doesn't look beat.`);
    }
    if (this.state.isDefender(player)) {
      throw new Error(`Defender doesn't get a beat vote.`);
    }

    if (!this.state.beatVotes.includes(player.id)) {
      this.state.beatVotes.push(player.id);
    }

    if (this.state.beatVotes.length === this.state.numPlayers - 1) {
      this.state.discard.topDeck(
        this.state.attacks.flatMap(({ attack, defense }) => [
          attack,
          ...(defense ? [defense] : []),
        ]),
      );
      this.state.incrementTurn();
    }

    await this.save(ctx);
  }

  static async findInDb(ctx: ApiRequestContext, id: string): Promise<?Game> {
    const serializedGame: ?SerializedGame = await ctx.serverContext.db
      .collection('games')
      .findOne({ id });
    if (!serializedGame) {
      return null;
    }
    const game = new Game(serializedGame);
    gamesCache.set(game.id, game);
    return game;
  }

  static async find(ctx: ApiRequestContext, id: string): Promise<?Game> {
    return gamesCache.get(id) || (await this.findInDb(ctx, id)) || null;
  }

  static async get(ctx: ApiRequestContext, id: string): Promise<?Game> {
    const game = await this.find(ctx, id);
    if (!game) {
      throw new Error(`No game found with id '${id}'`);
    }
    return game;
  }

  static async newUniqueId(ctx: ApiRequestContext) {
    const wl = await WordList.get('standard');
    let id = null;
    let attempts = 10;
    /* eslint-disable no-await-in-loop */
    while (wl && attempts > 0) {
      id = wl.getRandomId(3);
      if (!(await this.find(ctx, id))) {
        return id;
      }
      attempts -= 1;
    }
    /* eslint-enable no-await-in-loop */
    return uuid();
  }

  static async create(ctx: ApiRequestContext) {
    const id = await this.newUniqueId(ctx);
    const game = new Game({ id });
    gamesCache.set(id, game);
    return game;
  }
}
