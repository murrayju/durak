// @flow
import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';

import AppContext from '../contexts/AppContext';
import WordBoard from './WordBoard';
import Loading from './Loading';
import NotFound from './NotFound';
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

  useEffect(() => {
    setGame(null);
    fetch(`/api/game/${id}`, {
      method: 'GET',
    })
      .then(r => r.json())
      .then(setGame)
      .catch(() => setNotFound(true));
  }, [fetch, id]);
  return game?.state ? (
    <>
      <h1>{id}</h1>
      <GameBoard>
        <WordBoard gameState={game.state} />
      </GameBoard>
    </>
  ) : notFound ? (
    <NotFound />
  ) : (
    <Loading what="game state" />
  );
};

export default Game;
