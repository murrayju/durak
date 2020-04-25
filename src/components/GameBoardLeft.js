// @flow
import React from 'react';
import styled from 'styled-components';

import type Player from '../api/Player';
import PlayerHand from './PlayerHand';

const LeftSide = styled.div`
  flex: 1 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-evenly;
  flex-direction: column-reverse;
`;

const LeftHand = styled(PlayerHand)`
  flex: 0 0;
  transform: translate(50%, -50%) rotate(-90deg);
  transform-origin: bottom center;
`;

type Props = {
  players: Player[],
};

const GameBoardLeft = ({ players }: Props) => {
  return (
    <LeftSide>
      {players.map((p) => (
        <LeftHand key={p.id} player={p} side />
      ))}
    </LeftSide>
  );
};

export default GameBoardLeft;
