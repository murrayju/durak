// @flow
import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

import useEventSource from './useEventSource';
import useFetch from './useFetch';
import type { Client, SerializedTable, PlayAction } from '../api/Table';
import GameState from '../api/GameState';
import type Card from '../api/Card';
import type { TableContextType } from '../contexts/TableContext';

// It really would be overkill to use this in more than one place
// Just register the events once, and share with children via context
// See useTableContext
const useTableApi = (id: string): TableContextType => {
  const { fetch } = useFetch();
  const [table, setTable] = useState<?SerializedTable>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [errorMsg, setErrorMsg] = useState<?string>(null);
  const [cookies] = useCookies();
  const { clientId } = cookies;
  const client = table?.clients?.find((p) => p.id === clientId) || null;

  // subscribe to change events
  const connected = useEventSource(`/api/table/${id}/events`, (es) => {
    es.addEventListener('stateChanged', ({ data: rawData }) => {
      const data = JSON.parse(rawData);
      setTable(data);
    });
  });

  // get the initial state _after_ es connects, to avoid race condition caused by missed events
  useEffect(() => {
    setTable(null);
    if (connected) {
      fetch(`/api/table/${id}`, {
        method: 'GET',
      })
        .then((r) => r.json())
        .then(setTable)
        .catch(() => {
          setTable(null);
          setNotFound(true);
        });
    }
  }, [connected, fetch, id]);

  const gameState = GameState.deserialize(table?.state);
  const clients = table?.clients || [];
  const spectators = clients.filter((c) => !gameState.isPlayer(c, true) && c.joined);
  const config = table?.config || { pickUpTimer: 0 };

  // Join a player to the table
  const join = (playerInfo: Client) =>
    fetch(`/api/table/${id}/join`, {
      method: 'POST',
      body: JSON.stringify(playerInfo),
    });

  const newRound = async () =>
    fetch(`/api/table/${id}/newRound`, {
      method: 'POST',
    });

  const playCards = async (action: PlayAction) =>
    fetch(`/api/table/${id}/playCards`, {
      method: 'POST',
      body: JSON.stringify(action),
    });

  const setHandOrder = async (order: string[]) =>
    fetch(`/api/table/${id}/setHandOrder`, {
      method: 'POST',
      body: JSON.stringify(order),
    });

  const pickUpAttacks = async () =>
    fetch(`/api/table/${id}/pickUpAttacks`, {
      method: 'POST',
    });

  const declareDoneAttacking = async () =>
    fetch(`/api/table/${id}/declareDoneAttacking`, {
      method: 'POST',
    });

  const declareAsBeat = async () =>
    fetch(`/api/table/${id}/declareAsBeat`, {
      method: 'POST',
    });

  return {
    table,
    id,
    notFound,
    connected,
    spectators,
    clients,
    client,
    clientId,
    gameState,
    config,

    // methods
    join,
    newRound,
    playCards,
    setHandOrder,
    pickUpAttacks,
    declareDoneAttacking,
    declareAsBeat,

    // client-side
    selectedCards,
    setSelectedCards,
    errorMsg,
    setErrorMsg,
  };
};

export default useTableApi;
