// @flow
import React from 'react';
import styled from 'styled-components';

import type Player from '../api/Player';
import PlayerHand from './PlayerHand';

const TopSide = styled.div`
  flex: 1 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-evenly;
`;

const TopHand = styled(PlayerHand)`
  flex: 0 0;
`;

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
