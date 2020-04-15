// @flow
import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useCookies } from 'react-cookie';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import useEventSource from '../hooks/useEventSource';
import AppContext from '../contexts/AppContext';
import GameBoard from './GameBoard';
import GameLobby from './GameLobby';
import Icon from './Icon';
import IconButton from './IconButton';
import Loading from './Loading';
import NotFound from './NotFound';
import JoinGame from './JoinGame';
import ConfirmModal from './ConfirmModal';
import { Heading, FlowLeft, FlowCenter, FlowRight } from './flex';
import type { SerializedGame } from '../api/Game';
import GameState from '../api/GameState';

const Screen = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-flow: column;
`;

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

const PreloadImages = styled.div`
  background: ${({ urls }) => urls?.map(url => `url('${url}')`).join(', ')};
`;

type Props = {
  id: string,
};

const Game = ({ id }: Props) => {
  const { fetch } = useContext(AppContext);
  const [game, setGame] = useState<?SerializedGame>(null);
  const [notFound, setNotFound] = useState(false);
  const [newRoundModalShown, setNewRoundModalShown] = useState(false);
  const [deckImgMap, setDeckImgMap] = useState({});
  const [cookies] = useCookies();
  const { clientId } = cookies;
  const client = game?.clients?.find(p => p.id === clientId) || null;

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

  useEffect(() => {
    fetch(`/api/deck/imgMap`, {
      method: 'GET',
    })
      .then(r => r.json())
      .then(setDeckImgMap)
      .catch(err => {
        console.error('Failed to get deck image map.', err);
      });
  }, [fetch]);

  const esConnected = useEventSource(`/api/game/${id}/events`, es => {
    es.addEventListener('stateChanged', ({ data: rawData }) => {
      const data = JSON.parse(rawData);
      setGame(data);
    });
  });

  if (!game?.state) {
    return notFound ? <NotFound /> : <Loading what="game data" />;
  }
  const gameState = GameState.deserialize(game?.state);

  const newRound = () => {
    fetch(`/api/game/${id}/newRound`, {
      method: 'POST',
    }).then(r => r.json());
  };

  const pop = (popId, content) => <Popover id={popId}>{content}</Popover>;

  return (
    <Screen>
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
                {esConnected ? 'connected' : <strong className="text-warning">disconnected</strong>}
              </>,
            )}
            placement="bottom"
          >
            <Icon
              css=" && { margin-right: 20px; margin-left: 0; }"
              name={esConnected ? 'wifi' : 'user-slash'}
              color={esConnected ? 'success' : 'danger'}
            />
          </OverlayTrigger>
        </FlowRight>
      </Heading>
      {!client ? (
        <JoinGame id={id} clientId={clientId} />
      ) : gameState.gameStarted ? (
        <GameBoard client={client} gameState={gameState} />
      ) : (
        <GameLobby id={id} clients={game.clients || []} />
      )}
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
      <PreloadImages urls={Object.values(deckImgMap)} />
    </Screen>
  );
};

export default Game;
