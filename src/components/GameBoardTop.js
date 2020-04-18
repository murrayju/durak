// @flow
import React from 'react';
import styled from 'styled-components';

import type Player from '../api/Player';
import PlayerHand from './PlayerHand';

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

const TopHand = styled(PlayerHand)``;

type Props = {
  players: Player[],
};

const GameBoardTop = ({ players }: Props) => {
  return (
    <TopSide>
      {players.map((p) => (
        <TopHand key={p.id} player={p} />
      ))}
    </TopSide>
  );
};

export default GameBoardTop;
