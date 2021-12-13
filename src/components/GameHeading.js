// @flow
import React, { useState } from 'react';

import useTableContext from '../hooks/useTableContext';
import useFullScreen from '../hooks/useFullScreen';
import Icon from './Icon';
import IconButton from './IconButton';
import ConfirmModal from './ConfirmModal';
import Tooltip from './Tooltip';
import ConnectionIndicator from './ConnectionIndicator';
import { Heading, FlowLeft, FlowRight } from './flex';

const GameHeading = function () {
  const { client, connected, id, newRound, gameState } = useTableContext();
  const [newRoundModalShown, setNewRoundModalShown] = useState(false);
  const { isFullScreen, toggle: toggleFullScreen } = useFullScreen();

  return (
    <Heading>
      {client ? (
        <FlowLeft>
          <Tooltip popId="new-round" content="Shuffle the board and start a new round">
            <IconButton
              onClick={() =>
                gameState.gameStarted && !gameState.gameOver
                  ? setNewRoundModalShown(true)
                  : newRound()
              }
            >
              <Icon name="random" />
            </IconButton>
          </Tooltip>
        </FlowLeft>
      ) : null}
      <FlowRight>
        <div>
          <ConnectionIndicator what="Event stream" connected={connected} css="margin: 0.5em;" />
          <Tooltip popId="join-video" content="Join video conference call using jitsi">
            <IconButton onClick={() => window.open(`https://meet.jit.si/durak_${id}`, '_blank')}>
              <Icon name="video" />
            </IconButton>
          </Tooltip>
          <Tooltip popId="toggle-fullscreen" content="Toggle full screen mode">
            <IconButton onClick={toggleFullScreen}>
              <Icon name={isFullScreen ? 'compress' : 'expand'} />
            </IconButton>
          </Tooltip>
        </div>
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
