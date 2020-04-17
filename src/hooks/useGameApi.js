// @flow
import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

import useEventSource from './useEventSource';
import useFetch from './useFetch';
import type { Client, SerializedGame } from '../api/Game';
import GameState from '../api/GameState';

// It really would be overkill to use this in more than one place
// Just register the events once, and share with children via context
// See useGameContext
const useGameApi = (id: string) => {
  const { fetch } = useFetch();
  const [game, setGame] = useState<?SerializedGame>(null);
  const [notFound, setNotFound] = useState(false);
  const [cookies] = useCookies();
  const { clientId } = cookies;
  const client = game?.clients?.find((p) => p.id === clientId) || null;

  // get the initial state
  useEffect(() => {
    setGame(null);
    fetch(`/api/game/${id}`, {
      method: 'GET',
    })
      .then((r) => r.json())
      .then(setGame)
      .catch(() => {
        setGame(null);
        setNotFound(true);
      });
  }, [fetch, id]);

  // subscribe to change events
  const connected = useEventSource(`/api/game/${id}/events`, (es) => {
    es.addEventListener('stateChanged', ({ data: rawData }) => {
      const data = JSON.parse(rawData);
      setGame(data);
    });
  });

  const gameState = GameState.deserialize(game?.state);
  const clients = game?.clients || [];

  // Join a player to the game
  const join = (playerInfo: Client) =>
    fetch(`/api/game/${id}/join`, {
      method: 'POST',
      body: JSON.stringify(playerInfo),
    });

  const newRound = async () =>
    fetch(`/api/game/${id}/newRound`, {
      method: 'POST',
    });

  return { game, id, notFound, connected, clients, client, clientId, gameState, join, newRound };
};

export default useGameApi;
