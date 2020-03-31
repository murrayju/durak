// @flow
import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useCookies } from 'react-cookie';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import useEventSource from '../hooks/useEventSource';
import AppContext from '../contexts/AppContext';
import WordBoard from './WordBoard';
import Icon from './Icon';
import Loading from './Loading';
import NotFound from './NotFound';
import JoinGame from './JoinGame';
import type { GameDbData } from '../api/Game';

type Props = {
  id: string,
};

const Game = ({ id }: Props) => {
  const { fetch } = useContext(AppContext);
  const [game, setGame] = useState<?GameDbData>(null);
  const [notFound, setNotFound] = useState(false);
  const [cookies] = useCookies();
  const { clientId } = cookies;
  const player = game?.players?.find(p => p.id === clientId) || null;

  useEffect(() => {
    setGame(null);
    fetch(`/api/game/${id}`, {
      method: 'GET',
    })
      .then(r => r.json())
      .then(setGame)
      .catch(() => {
        setGame(null);
        setNotFound(true);
      });
  }, [fetch, id]);

  const esConnected = useEventSource(`/api/game/${id}/events`, es => {
    es.addEventListener('stateChanged', ({ data: rawData }) => {
      const data = JSON.parse(rawData);
      setGame(data);
    });
  });

  if (!game?.state) {
    return notFound ? <NotFound /> : <Loading what="game data" />;
  }

  const selectTile = (index: number) => {
    fetch(`/api/game/${id}/selectTile/${index}`, {
      method: 'POST',
    }).then(r => r.json());
  };

  const esPopover = (
    <Popover id="event-stream">
      Event stream{' '}
      {esConnected ? 'connected' : <strong className="text-warning">disconnected</strong>}
    </Popover>
  );

  const vidPopover = <Popover id="join-video">Join video conference call</Popover>;

  return (
    <>
      <div>
        <OverlayTrigger overlay={vidPopover} placement="bottom" delayShow={300} delayHide={150}>
          <a href={`https://meet.jit.si/codenames_${id}`} target="_blank" rel="noopener noreferrer">
            <Icon name="video" />
          </a>
        </OverlayTrigger>{' '}
        <OverlayTrigger overlay={esPopover} placement="bottom" delayShow={300} delayHide={150}>
          <Icon
            name={esConnected ? 'wifi' : 'user-slash'}
            color={esConnected ? 'success' : 'danger'}
          />
        </OverlayTrigger>
      </div>
      {!player ? (
        <JoinGame id={id} clientId={clientId} />
      ) : (
        <WordBoard player={player} gameState={game.state} onTileSelected={selectTile} />
      )}
    </>
  );
};

export default Game;
