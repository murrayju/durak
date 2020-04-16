// @flow
import React from 'react';
import styled from 'styled-components';

import type Player from '../api/Player';
import PlayerName from './PlayerName';
import Hand from './Hand';

const LeftSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column-reverse;
  position: absolute;
  left: 0px;
`;

const LeftHand = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0px;
  transform: rotate(-90deg);

  @media (min-width: ${({ theme }) => {
      return theme.screen.smMin;
    }}) {
    padding: 80px 0px;
  }

  @media (min-width: ${({ theme }) => {
      return theme.screen.lgMin;
    }}) {
    padding: 150px 0px;
  }
`;

type Props = {
  players: Player[],
  playerIndicator: Player => any,
};

const GameBoardLeft = ({ players, playerIndicator }: Props) => {
  return (
    <LeftSide>
      {players.map(p => (
        <LeftHand>
          <Hand hand={p.hand} />
          <PlayerName>
            {p.name} {playerIndicator(p)}
          </PlayerName>
        </LeftHand>
      ))}
    </LeftSide>
  );
};

export default GameBoardLeft;
