// @flow
import React from 'react';
import styled from 'styled-components';

import type Player from '../api/Player';
import PlayerHand from './PlayerHand';

const LeftSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column-reverse;
  position: absolute;
  left: 0px;
`;

const LeftHand = styled(PlayerHand)`
  transform: rotate(-90deg);
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
