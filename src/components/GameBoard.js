// @flow
import React, { useState } from 'react';
import styled from 'styled-components';

import type { Client } from '../api/Game';
import type GameState from '../api/GameState';
import type Player from '../api/Player';
import Hand from './Hand';
import Icon from './Icon';

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

const MainHand = styled.div`
  position: absolute;
  bottom: -50px;
  width: 100%;
`;

const MainHandIndicators = styled.div`
  position: fixed;
  bottom: 0;
  left: 10px;
  font-size: 3em;
`;

type Props = {
  client: Client,
  gameState: GameState,
};

const GameBoard = ({ client, gameState }: Props) => {
  const [selectedCards, setSelectedCards] = useState([]);
  const { width, height } = useScreenSize();

  if (!gameState) {
    return null;
  }

  const screenRatio = width / height;

  const { players, turn } = gameState;
  const numPlayers = players.length;
  const playerIndex = players.findIndex(p => p.id === client.id);
  const player = players[playerIndex] || null;

  const relPlayer = (offset, source = playerIndex) =>
    players[(source + numPlayers + offset) % numPlayers];

  const attacker = relPlayer(0, turn);
  const defender = relPlayer(1, turn);

  let midPlayers: Player[] = [];
  let leftPlayers: Player[] = [];
  let rightPlayers: Player[] = [];

  // I'm sure you can do this fancier.. feel free but in case it needs to change I didnt want to spend time on a crazy algorithm
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

  const playerIndicator = p =>
    p === attacker ? (
      <Icon name="dragon" />
    ) : p === defender ? (
      <Icon name="chess-rook" />
    ) : (
      <Icon name="burn" css="visibility: hidden;" />
    );

  return (
    <Board>
      {midPlayers && <BoardTop players={midPlayers} playerIndicator={playerIndicator} />}
      {leftPlayers && <BoardLeft players={leftPlayers} playerIndicator={playerIndicator} />}
      {rightPlayers && <BoardRight players={rightPlayers} playerIndicator={playerIndicator} />}
      {player && (
        <MainHand>
          <Hand
            primary
            hand={player.hand}
            selected={selectedCards}
            onCardClick={c =>
              setSelectedCards(sel =>
                sel.find(s => s.id === c.id) ? sel.filter(s => s.id !== c.id) : [...sel, c],
              )
            }
          />
          <MainHandIndicators>{playerIndicator(player)}</MainHandIndicators>
        </MainHand>
      )}
    </Board>
  );
};

export default GameBoard;
