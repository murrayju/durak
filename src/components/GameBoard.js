// @flow
import React from 'react';
import styled from 'styled-components';

import useGameContext from '../hooks/useGameContext';
import type Player from '../api/Player';
import MainHand from './MainHand';

import PlayArea from './PlayArea';
import BoardTop from './GameBoardTop';
import BoardLeft from './GameBoardLeft';
import BoardRight from './GameBoardRight';

import useScreenSize from '../hooks/useScreenSize';

const Board = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: column;
  width: 100%;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 100;
`;

const GameBoard = () => {
  const { clientId, gameState } = useGameContext();
  const { width, height } = useScreenSize();

  const screenRatio = width / height;

  const { players } = gameState;
  const numPlayers = players.length;
  // Show either this client's player (if they are part of the game)
  // OR whichever player's turn it is as the "main player"
  const player = gameState.getPlayer(clientId) || gameState.primaryAttacker;
  const playerIndex = players.indexOf(player);

  const relPlayer = (offset, source = playerIndex) => gameState.relativePlayer(offset, source);

  let midPlayers: Player[] = [];
  let leftPlayers: Player[] = [];
  let rightPlayers: Player[] = [];

  // I'm sure you can do this fancier.. feel free but in case it needs to change I didn't want to spend time on a crazy algorithm
  if (numPlayers === 2) {
    midPlayers = [relPlayer(1)];
  } else if (numPlayers === 3) {
    midPlayers = [relPlayer(1)];
    rightPlayers = [relPlayer(2)];
  } else if (numPlayers === 4) {
    leftPlayers = [relPlayer(1)];
    midPlayers = [relPlayer(2)];
    rightPlayers = [relPlayer(3)];
  } else if (numPlayers === 5) {
    if (screenRatio > 1) {
      // spread over mid
      leftPlayers = [relPlayer(1)];
      midPlayers = [relPlayer(2), relPlayer(3)];
      rightPlayers = [relPlayer(4)];
    } else {
      // spread over left/right
      leftPlayers = [relPlayer(1), relPlayer(2)];
      midPlayers = [relPlayer(3)];
      rightPlayers = [relPlayer(4)];
    }
  } else if (numPlayers === 6) {
    if (screenRatio > 1) {
      // spread over mid
      leftPlayers = [relPlayer(1)];
      midPlayers = [relPlayer(2), relPlayer(3), relPlayer(4)];
      rightPlayers = [relPlayer(5)];
    } else {
      // spread over left/right
      leftPlayers = [relPlayer(1), relPlayer(2)];
      midPlayers = [relPlayer(3)];
      rightPlayers = [relPlayer(4), relPlayer(5)];
    }
  } else if (numPlayers === 7) {
    if (screenRatio > 1) {
      // spread over mid
      leftPlayers = [relPlayer(1), relPlayer(2)];
      midPlayers = [relPlayer(3), relPlayer(4), relPlayer(5)];
      rightPlayers = [relPlayer(6)];
    } else {
      // spread over left/right
      leftPlayers = [relPlayer(1), relPlayer(2), relPlayer(3)];
      midPlayers = [relPlayer(4)];
      rightPlayers = [relPlayer(5), relPlayer(6)];
    }
  } else if (numPlayers === 8) {
    if (screenRatio > 1) {
      // spread over mid
      leftPlayers = [relPlayer(1), relPlayer(2)];
      midPlayers = [relPlayer(3), relPlayer(4), relPlayer(5)];
      rightPlayers = [relPlayer(6), relPlayer(7)];
    } else {
      // spread over left/right
      leftPlayers = [relPlayer(1), relPlayer(2), relPlayer(3)];
      midPlayers = [relPlayer(4)];
      rightPlayers = [relPlayer(5), relPlayer(6), relPlayer(7)];
    }
  }

  return (
    <Board>
      {midPlayers && <BoardTop players={midPlayers} />}
      {leftPlayers && <BoardLeft players={leftPlayers} />}
      {rightPlayers && <BoardRight players={rightPlayers} />}
      <PlayArea />
      {player && <MainHand />}
    </Board>
  );
};

export default GameBoard;
