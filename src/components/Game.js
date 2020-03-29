// @flow
import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useCookies } from 'react-cookie';

import useEventSource from '../hooks/useEventSource';
import AppContext from '../contexts/AppContext';
import WordBoard from './WordBoard';
import Icon from './Icon';
import Loading from './Loading';
import NotFound from './NotFound';
import JoinGame from './JoinGame';
import type { GameDbData } from '../api/Game';

const GameBoard = styled.div`
  width: 100%;
  position: relative;
  max-width: 1750px;
`;

type Props = {
  id: string,
};

const Game = ({ id }: Props) => {
  const { fetch } = useContext(AppContext);
  const [game, setGame] = useState<?GameDbData>(null);
  const [notFound, setNotFound] = useState(false);
  const [cookies] = useCookies();
  const { clientId } = cookies;
  const player = game?.players?.find(p => p.id === clientId) || null;

  useEffect(() => {
    setGame(null);
    fetch(`/api/game/${id}`, {
      method: 'GET',
    })
      .then(r => r.json())
      .then(setGame)
      .catch(() => {
        setGame(null);
        setNotFound(true);
      });
  }, [fetch, id]);

  const esConnected = useEventSource(`/api/game/${id}/events`, es => {
    es.addEventListener('stateChanged', ({ data: rawData }) => {
      const data = JSON.parse(rawData);
      setGame(data);
    });
  });

  if (!game?.state) {
    return notFound ? <NotFound /> : <Loading what="game data" />;
  }

  return (
    <>
      {esConnected ? (
        <div>
          <Icon name="wifi" color="success" /> event stream connected
        </div>
      ) : (
        <div>
          <Icon name="user-slash" color="warning" /> event stream{' '}
          <strong className="text-warning">disconnected</strong>
        </div>
      )}
      {!player ? (
        <JoinGame id={id} clientId={clientId} />
      ) : (
        <GameBoard>
          <WordBoard player={player} gameState={game.state} />
        </GameBoard>
      )}
    </>
  );
};

export default Game;
