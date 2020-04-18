// @flow
import React from 'react';

import type { SerializedGame, Client, PlayAction } from '../api/Game';
import type GameState from '../api/GameState';

export type GameContextType = {
  game?: ?SerializedGame,
  id: string,
  notFound: boolean,
  connected: boolean,
  clients: Client[],
  client: ?Client,
  clientId: string,
  gameState: GameState,
  join: (Client) => Promise<void>,
  newRound: () => Promise<void>,
  playCards: (PlayAction) => Promise<void>,
};

const GameContext = React.createContext<GameContextType>({});
export default GameContext;
