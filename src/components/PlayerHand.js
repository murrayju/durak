// @flow
import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'react-bootstrap';

import useTableContext from '../hooks/useTableContext';
import type Player from '../api/Player';
import PlayerName from './PlayerName';
import PlayerIndicator from './PlayerIndicator';
import ConnectionIndicator from './ConnectionIndicator';
import Hand from './Hand';
import Icon from './Icon';

const Box = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const BeatTip = styled(Tooltip)`
  position: absolute;
  bottom: -25px;
`;

const Crown = styled(Icon)`
  color: ${({ theme }) => theme.table.gold};
  font-size: 2em;
  @media (min-width: ${({ theme }) => theme.screen.smMin}) {
    font-size: 3em;
  }
  @media (min-width: ${({ theme }) => theme.screen.lgMin}) {
    font-size: 4em;
  }
`;

type Props = {
  player: Player,
  className?: string,
};

const PlayerHand = ({ player, className }: Props) => {
  const { clients, gameState } = useTableContext();
  const connected = !!clients.find(({ id }) => id === player.id)?.connected;
  return (
    <Box className={className}>
      {player.out ? <Crown name="crown" /> : <Hand hand={player.hand} rotate="180deg" />}
      <PlayerName>
        <ConnectionIndicator what={`${player.name} is`} connected={connected} /> {player.name}{' '}
        <PlayerIndicator player={player} />
      </PlayerName>
      {gameState.beatVotes.includes(player.id) && (
        <BeatTip placement="bottom" id={`${player.name}-beat`} className="in">
          It&apos;s beat!
        </BeatTip>
      )}
    </Box>
  );
};
PlayerHand.defaultProps = {
  className: '',
};

export default PlayerHand;
