// @flow
import React, { useState } from 'react';
import styled from 'styled-components';

import type Player from '../api/Player';
import type { Client } from '../api/Game';
import type GameState from '../api/GameState';
import Hand from './Hand';
import Icon from './Icon';

import useScreenSize from '../hooks/useScreenSize';

const Board = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: column;
  width: 100%;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const MainHand = styled.div`
  position: absolute;
  bottom: -50px;
  width: 100%;
`;

const LeftSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column-reverse;
  position: absolute;
  left: 20px;
`;

const LeftHand = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0px;
  transform: rotate(-90deg);
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: absolute;
  right: 20px;
`;

const RightHand = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0px;
  transform: rotate(90deg);
`;

const TopSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  padding: 0 80px;
  top: 0;
  left: 0;
  right: 0;
`;

const TopHand = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
`;

const PlayerName = styled.div`
  font-size: 1em;
  margin-top: -10px;

  @media (min-width: ${({ theme }) => {
      return theme.screen.smMin;
    }}) {
    margin-top: 10px;
    font-size: 1.2em;
  }

  @media (min-width: ${({ theme }) => {
      return theme.screen.lgMin;
    }}) {
    margin-top: 25px;
    font-size: 1.5em;
  }
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

  let midPlayers = [];
  let leftPlayers = [];
  let rightPlayers = [];

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

  // old one:
  // const leftPlayers = numPlayers > 1 ? [relPlayer(1)] : null;
  // const rightPlayers = numPlayers > 2 ? [relPlayer(-1)] : null;
  // const midPlayers =
  //   numPlayers > 3 ? Array.from({ length: numPlayers - 3 }).map((_, i) => relPlayer(2 + i)) : null;

  const playerIndicator = p =>
    p === attacker ? (
      <Icon name="dragon" size="3em" />
    ) : p === defender ? (
      <Icon name="chess-rook" size="3em" />
    ) : (
      <Icon name="burn" size="3em" css="visibility: hidden;" />
    );

  return (
    <Board>
      {midPlayers && (
        <TopSide>
          {midPlayers.map(p => (
            <TopHand key={p.id}>
              <Hand hand={p.hand} />
              <PlayerName>{p.name}</PlayerName>
              {playerIndicator(p)}
            </TopHand>
          ))}
        </TopSide>
      )}
      {leftPlayers && (
        <LeftSide>
          {leftPlayers.map(p => (
            <LeftHand>
              <Hand hand={p.hand} />
              <PlayerName>{p.name}</PlayerName>
              {playerIndicator(p)}
            </LeftHand>
          ))}
        </LeftSide>
      )}
      {rightPlayers && (
        <RightSide>
          {rightPlayers.map(p => (
            <RightHand>
              <Hand hand={p.hand} />
              <PlayerName>{p.name}</PlayerName>
              {playerIndicator(p)}
            </RightHand>
          ))}
        </RightSide>
      )}
      {player && (
        <MainHand>
          {playerIndicator(player)}
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
        </MainHand>
      )}
    </Board>
  );
};

export default GameBoard;
