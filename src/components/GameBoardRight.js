// @flow
import React from 'react';
import styled from 'styled-components';

import type Player from '../api/Player';
import PlayerName from './PlayerName';
import Hand from './Hand';

const RightSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: absolute;
  right: 0px;
`;

const RightHand = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0px;
  transform: rotate(90deg);

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

const GameBoardRight = ({ players, playerIndicator }: Props) => {
  return (
    <RightSide>
      {players.map(p => (
        <RightHand>
          <Hand hand={p.hand} />
          <PlayerName>
            {p.name} {playerIndicator(p)}
          </PlayerName>
        </RightHand>
      ))}
    </RightSide>
  );
};

export default GameBoardRight;
