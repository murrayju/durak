// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import useGameContext from '../hooks/useGameContext';
import Icon from './Icon';
import IconButton from './IconButton';
import ConfirmModal from './ConfirmModal';
import { Heading, FlowLeft, FlowCenter, FlowRight } from './flex';

const ColoredHeading = styled.h2`
  color: ${({
    theme: {
      game: { spyRed, spyBlue, spyBlack },
    },
    color,
  }) => (color === 'red' ? spyRed : color === 'blue' ? spyBlue : spyBlack)};
  font-variant: small-caps;
  text-transform: capitalize;
  cursor: ${({ onClick }) => onClick && 'pointer'};
`;

const GameHeading = () => {
  const { client, connected, id, newRound, gameState } = useGameContext();
  const [newRoundModalShown, setNewRoundModalShown] = useState(false);

  const pop = (popId, content) => <Popover id={popId}>{content}</Popover>;

  return (
    <Heading>
      {client ? (
        <>
          <FlowLeft>
            <OverlayTrigger
              overlay={pop('new-round', 'Shuffle the board and start a new round')}
              placement="bottom"
            >
              <IconButton
                onClick={() =>
                  gameState.gameStarted && !gameState.gameOver
                    ? setNewRoundModalShown(true)
                    : newRound()
                }
              >
                <Icon name="random" />
              </IconButton>
            </OverlayTrigger>{' '}
          </FlowLeft>
          <FlowCenter>
            {gameState.gameOver ? <ColoredHeading color="black">Game Over</ColoredHeading> : null}
          </FlowCenter>
        </>
      ) : null}
      <FlowRight>
        <OverlayTrigger
          overlay={pop('join-video', 'Join video conference call using jitsi')}
          placement="bottom"
        >
          <IconButton onClick={() => window.open(`https://meet.jit.si/durak_${id}`, '_blank')}>
            <Icon name="video" />
          </IconButton>
        </OverlayTrigger>{' '}
        <OverlayTrigger
          overlay={pop(
            'event-stream',
            <>
              Event stream{' '}
              {connected ? 'connected' : <strong className="text-warning">disconnected</strong>}
            </>,
          )}
          placement="bottom"
        >
          <Icon
            css=" && { margin-right: 20px; margin-left: 0; }"
            name={connected ? 'wifi' : 'user-slash'}
            color={connected ? 'success' : 'danger'}
          />
        </OverlayTrigger>
      </FlowRight>
      {newRoundModalShown && (
        <ConfirmModal
          title="Are you sure?"
          message="The game is still in progress, do you really want to start a new round now?"
          onCancel={() => setNewRoundModalShown(false)}
          onConfirm={() => {
            newRound();
            setNewRoundModalShown(false);
          }}
        />
      )}
    </Heading>
  );
};

export default GameHeading;
