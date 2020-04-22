// @flow
import React from 'react';
import styled from 'styled-components';

import useGameApi from '../hooks/useGameApi';
import GameContext from '../contexts/GameContext';
import GameBoard from './GameBoard';
import GameLobby from './GameLobby';
import Loading from './Loading';
import NotFound from './NotFound';
import JoinGame from './JoinGame';
import GameHeading from './GameHeading';
import PreloadDeckImages from './PreloadDeckImages';

const Screen = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-flow: column;
`;

type Props = {
  id: string,
};

const Game = ({ id }: Props) => {
  const gameContext = useGameApi(id);
  const { game, notFound, client, gameState } = gameContext;

  return game?.state ? (
    <GameContext.Provider value={gameContext}>
      <Screen>
        <GameHeading />
        {!client?.joined ? <JoinGame /> : gameState.gameStarted ? <GameBoard /> : <GameLobby />}
        <PreloadDeckImages />
      </Screen>
    </GameContext.Provider>
  ) : notFound ? (
    <NotFound />
  ) : (
    <Loading what="game data" />
  );
};

export default Game;
