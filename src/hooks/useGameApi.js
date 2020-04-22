// @flow
import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

import useEventSource from './useEventSource';
import useFetch from './useFetch';
import type { Client, SerializedGame, PlayAction } from '../api/Game';
import GameState from '../api/GameState';
import type Card from '../api/Card';
import type { GameContextType } from '../contexts/GameContext';

// It really would be overkill to use this in more than one place
// Just register the events once, and share with children via context
// See useGameContext
const useGameApi = (id: string): GameContextType => {
  const { fetch } = useFetch();
  const [game, setGame] = useState<?SerializedGame>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [errorMsg, setErrorMsg] = useState<?string>(null);
  const [cookies] = useCookies();
  const { clientId } = cookies;
  const client = game?.clients?.find((p) => p.id === clientId) || null;

  // subscribe to change events
  const connected = useEventSource(`/api/game/${id}/events`, (es) => {
    es.addEventListener('stateChanged', ({ data: rawData }) => {
      const data = JSON.parse(rawData);
      setGame(data);
    });
  });

  // get the initial state _after_ es connects, to avoid race condition caused by missed events
  useEffect(() => {
    setGame(null);
    if (connected) {
      fetch(`/api/game/${id}`, {
        method: 'GET',
      })
        .then((r) => r.json())
        .then(setGame)
        .catch(() => {
          setGame(null);
          setNotFound(true);
        });
    }
  }, [connected, fetch, id]);

  const gameState = GameState.deserialize(game?.state);
  const clients = game?.clients || [];
  const spectators = clients.filter((c) => !gameState.isPlayer(c));

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

  const playCards = async (action: PlayAction) =>
    fetch(`/api/game/${id}/playCards`, {
      method: 'POST',
      body: JSON.stringify(action),
    });

  const pickUpAttacks = async () =>
    fetch(`/api/game/${id}/pickUpAttacks`, {
      method: 'POST',
    });

  const declareAsBeat = async () =>
    fetch(`/api/game/${id}/declareAsBeat`, {
      method: 'POST',
    });

  return {
    game,
    id,
    notFound,
    connected,
    spectators,
    clients,
    client,
    clientId,
    gameState,
    join,
    newRound,
    playCards,
    pickUpAttacks,
    declareAsBeat,

    // client-side
    selectedCards,
    setSelectedCards,
    errorMsg,
    setErrorMsg,
  };
};

export default useGameApi;
