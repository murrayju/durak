// @flow
import React from 'react';
import styled from 'styled-components';

import type Player from '../api/Player';
import PlayerHand from './PlayerHand';

const RightSide = styled.div`
  flex: 1 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-evenly;
  flex-direction: column;
`;

const RightHand = styled(PlayerHand)`
  flex: 0 0;
  transform: translate(-50%, -50%) rotate(90deg);
  transform-origin: bottom center;
`;

type Props = {
  players: Player[],
};

const GameBoardRight = ({ players }: Props) => {
  return (
    <RightSide>
      {players.map((p) => (
        <RightHand key={p.id} player={p} side />
      ))}
    </RightSide>
  );
};

export default GameBoardRight;
