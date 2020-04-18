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
  const { turn } = gameState;

  const attacker = gameState.relativePlayer(0, turn);
  const defender = gameState.relativePlayer(1, turn);
  const isAttacker = player === attacker;
  const isDefender = player === defender;

  return isAttacker ? (
    <Icon name="dragon" />
  ) : isDefender ? (
    <Icon name="chess-rook" />
  ) : (
    <Icon name="burn" css="visibility: hidden;" />
  );
};

export default PlayerIndicator;
