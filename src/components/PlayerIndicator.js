// @flow
import React from 'react';

import useGameContext from '../hooks/useGameContext';
import Icon from './Icon';
import type Player from '../api/Player';

type Props = {
  player: Player,
};

const PlayerIndicator = ({ player }: Props) => {
  const { gameState } = useGameContext();
  const isAttacker = gameState.isPrimaryAttacker(player);
  const isDefender = gameState.isDefender(player);

  return isAttacker ? (
    <Icon name="dragon" />
  ) : isDefender ? (
    <Icon name="chess-rook" />
  ) : (
    <Icon name="burn" css="visibility: hidden;" />
  );
};

export default PlayerIndicator;
