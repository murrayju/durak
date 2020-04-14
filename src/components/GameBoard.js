// @flow
import React, { useState } from 'react';
import styled from 'styled-components';

import type Player from '../api/Player';
import type { Client } from '../api/Game';
import type GameState from '../api/GameState';
import Hand from './Hand';
import Icon from './Icon';

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
  position: absolute;
  left: calc(-50vh + 90px);
  top: 0;
  bottom: 0;
`;

const LeftHand = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  width: 100vh;
  transform: rotate(-90deg);
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: calc(-50vh + 90px);
  top: 0;
  bottom: 0;
`;

const RightHand = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  width: 100vh;
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
  margin-top: 10px;
  font-size: 1.5em;

  @media (min-width: ${({ theme }) => {
      return theme.screen.smMin;
    }}) {
    margin-top: 70px;
  }
`;

type Props = {
  client: Client,
  gameState: GameState,
};

const GameBoard = ({ client, gameState }: Props) => {
  const [selectedCards, setSelectedCards] = useState([]);

  if (!gameState) {
    return null;
  }

  const { players, turn } = gameState;
  const numPlayers = players.length;
  const playerIndex = players.findIndex(p => p.id === client.id);
  const player = players[playerIndex] || null;

  const relPlayer = (offset, source = playerIndex) =>
    players[(source + numPlayers + offset) % numPlayers];

  const attacker = relPlayer(0, turn);
  const defender = relPlayer(1, turn);

  const leftPlayer = numPlayers > 1 ? relPlayer(1) : null;
  const rightPlayer = numPlayers > 2 ? relPlayer(-1) : null;
  const midPlayers =
    numPlayers > 3 ? Array.from({ length: numPlayers - 3 }).map((_, i) => relPlayer(2 + i)) : null;

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
      {leftPlayer && (
        <LeftSide>
          <LeftHand>
            <Hand hand={leftPlayer.hand} />
            <PlayerName>{leftPlayer.name}</PlayerName>
            {playerIndicator(leftPlayer)}
          </LeftHand>
        </LeftSide>
      )}
      {rightPlayer && (
        <RightSide>
          <RightHand>
            <Hand hand={rightPlayer.hand} />
            <PlayerName>{rightPlayer.name}</PlayerName>
            {playerIndicator(rightPlayer)}
          </RightHand>
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
