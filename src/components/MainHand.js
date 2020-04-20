// @flow
import React from 'react';
import styled from 'styled-components';
import { position } from 'polished';

import useGameContext from '../hooks/useGameContext';
import Hand from './Hand';
import Icon from './Icon';
import IconButton from './IconButton';
import PlayerIndicator from './PlayerIndicator';

const Box = styled.div`
  ${position('absolute', null, 0, 0, 0)}
  height: 95px;
  @media (min-width: ${({ theme }) => theme.screen.smMin}) {
    height: 140px;
  }
  @media (min-width: ${({ theme }) => theme.screen.lgMin}) {
    height: 200px;
  }
  display: flex;
  justify-content: center;
`;

const TheHand = styled(Hand)`
  position: absolute;
  bottom: -50px;
`;

const MainHandIndicators = styled.div`
  position: absolute;
  bottom: 0;
  left: 10px;
  font-size: 3em;
  display: flex;
  flex-flow: row;
  align-items: center;
  padding: 10px;
`;

const PlayerName = styled.h2`
  position: absolute;
  top: -50px;
  white-space: nowrap;
`;

const Actions = styled.div`
  position: absolute;
  bottom: 10px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  > {
    &:not(:last-child) {
      margin-right: 10px;
    }
  }
`;

const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.brand.danger};
  font-size: 2rem;
  padding: 0 15px;
`;

const MainHand = () => {
  const {
    clientId,
    gameState,
    playCards,
    declareAsBeat,
    selectedCards,
    setSelectedCards,
    errorMsg,
    setErrorMsg,
  } = useGameContext();

  const player = gameState.getPlayer(clientId) || gameState.attacker;
  const isPlaying = player.id === clientId;
  const isDefender = gameState.isDefender(clientId);

  const attack = () => {
    setErrorMsg(null);
    playCards({
      type: 'attack',
      cards: selectedCards.map(({ id }) => ({ id })),
    }).then(
      () => setSelectedCards([]),
      (err) => {
        setErrorMsg(err.message.replace('Fetch failed: ', ''));
        setSelectedCards([]);
      },
    );
  };

  const itsBeat = () => {
    setErrorMsg(null);
    declareAsBeat().then(null, (err) => {
      setErrorMsg(err.message.replace('Fetch failed: ', ''));
    });
  };

  return (
    <Box>
      <TheHand
        primary
        canDrag
        hand={player.hand}
        selected={selectedCards}
        onCardClick={(c) =>
          setSelectedCards((sel) =>
            sel.find((s) => s.id === c.id)
              ? sel.filter((s) => s.id !== c.id)
              : [...(isDefender ? [] : sel), c],
          )
        }
      />
      <MainHandIndicators>
        <PlayerName>{player.name}</PlayerName>
        <PlayerIndicator player={player} />
        {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
      </MainHandIndicators>
      {isPlaying && (
        <Actions>
          {!isDefender && selectedCards.length > 0 ? (
            <IconButton primary text onClick={attack}>
              <Icon name="dragon" />
              Attack
            </IconButton>
          ) : null}
          {gameState.attacks.length > 0 && gameState.unbeatenAttacks.length === 0 ? (
            <IconButton
              primary
              text
              onClick={itsBeat}
              disabled={gameState.beatVotes.includes(player.id)}
            >
              <Icon name="trophy" />
              It&apos;s beat
            </IconButton>
          ) : null}
        </Actions>
      )}
    </Box>
  );
};

export default MainHand;
