// @flow
import React from 'react';
import styled from 'styled-components';

import type Player from '../api/Player';
import PlayerHand from './PlayerHand';

const RightSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: absolute;
  right: 0px;
`;

const RightHand = styled(PlayerHand)`
  transform: rotate(90deg);
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
