// @flow
import React from 'react';

import type { SerializedTable, Client, PlayAction, TableConfig } from '../api/Table';
import type GameState from '../api/GameState';
import type Card from '../api/Card';

type SetterFn<T> = (T | ((T) => T)) => void;

export type TableContextType = {
  table?: ?SerializedTable,
  id: string,
  notFound: boolean,
  connected: boolean,
  clients: Client[],
  spectators: Client[],
  client: ?Client,
  clientId: string,
  gameState: GameState,
  config: TableConfig,
  join: (Client) => Promise<void>,
  newRound: () => Promise<void>,
  playCards: (PlayAction) => Promise<void>,
  pickUpAttacks: () => Promise<void>,
  declareDoneAttacking: () => Promise<void>,
  declareAsBeat: () => Promise<void>,

  // Client-only state
  selectedCards: Card[],
  setSelectedCards: SetterFn<Card[]>,
  errorMsg: ?string,
  setErrorMsg: SetterFn<?string>,
};

const TableContext = React.createContext<TableContextType>({});
export default TableContext;
