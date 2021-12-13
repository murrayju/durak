// @flow
import React from 'react';
import styled from 'styled-components';

import useTableContext from '../hooks/useTableContext';
import Hand from './Hand';
import Icon from './Icon';
import IconButton from './IconButton';
import PlayerIndicator from './PlayerIndicator';

const Box = styled.div`
  flex: 1 1;
  display: flex;
  justify-content: center;
`;

const TheHand = styled(Hand)`
  align-items: flex-start;
  margin-top: 5px;
  @media (min-width: ${({ theme }) => theme.screen.smMin}) {
    margin-top: 10px;
  }
  @media (min-width: ${({ theme }) => theme.screen.lgMin}) {
    margin-top: 15px;
  }
`;

const Crown = styled(Icon)`
  color: ${({ theme }) => theme.table.gold};
  font-size: 4em;
  margin-top: 5px;
  @media (min-width: ${({ theme }) => theme.screen.smMin}) {
    font-size: 5em;
    margin-top: 10px;
  }
  @media (min-width: ${({ theme }) => theme.screen.lgMin}) {
    font-size: 6em;
    margin-top: 15px;
  }
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

const MainHand = function () {
  const { clientId, gameState, playCards, selectedCards, setSelectedCards, errorMsg, setErrorMsg } =
    useTableContext();

  const player = gameState.getPlayer(clientId, true) || gameState.primaryAttacker;
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

  return (
    <Box>
      {player.out ? (
        <Crown name="crown" />
      ) : (
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
      )}
      <MainHandIndicators>
        <PlayerName>{player.name}</PlayerName>
        <PlayerIndicator player={player} />
        {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
      </MainHandIndicators>
      {isPlaying && !isDefender && (
        <Actions>
          {selectedCards.length > 0 ? (
            <IconButton primary text onClick={attack}>
              <Icon name="dragon" />
              Attack
            </IconButton>
          ) : null}
        </Actions>
      )}
    </Box>
  );
};

export default MainHand;
