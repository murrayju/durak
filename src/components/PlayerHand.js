// @flow
import React from 'react';
import styled from 'styled-components';

import useTableContext from '../hooks/useTableContext';
import type Player from '../api/Player';
import PlayerName from './PlayerName';
import PlayerIndicator from './PlayerIndicator';
import ConnectionIndicator from './ConnectionIndicator';
import Hand from './Hand';

const Box = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;

  padding: ${({ side }) => (side ? `50px 0px` : null)};
  @media (min-width: ${({ theme }) => {
      return theme.screen.smMin;
    }}) {
    padding: ${({ side }) => (side ? `80px 0px` : null)};
  }

  @media (min-width: ${({ theme }) => {
      return theme.screen.lgMin;
    }}) {
    padding: ${({ side }) => (side ? `150px 0px` : null)};
  }
`;

type Props = {
  player: Player,
  side: boolean,
  className?: string,
};

const PlayerHand = ({ player, side, className }: Props) => {
  const { clients } = useTableContext();
  const connected = !!clients.find(({ id }) => id === player.id)?.connected;
  return (
    <Box side={side} className={className}>
      <Hand hand={player.hand} />
      <PlayerName>
        <ConnectionIndicator what={`${player.name} is`} connected={connected} /> {player.name}{' '}
        <PlayerIndicator player={player} />
      </PlayerName>
    </Box>
  );
};
PlayerHand.defaultProps = {
  className: '',
};

export default PlayerHand;
