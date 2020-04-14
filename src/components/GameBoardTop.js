// @flow
import React from 'react';
import styled from 'styled-components';

import type Player from '../api/Player';
import PlayerName from './PlayerName';
import Hand from './Hand';

const TopSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  padding: 0 80px;
  top: 50px;
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

type Props = {
  players: [Player],
  playerIndicator: func,
};

const GameBoardTop = ({ players, playerIndicator }: Props) => {
  return (
    <TopSide>
      {players.map(p => (
        <TopHand key={p.id}>
          <Hand hand={p.hand} />
          <PlayerName>
            {p.name}
            {playerIndicator(p)}
          </PlayerName>
        </TopHand>
      ))}
    </TopSide>
  );
};

export default GameBoardTop;
