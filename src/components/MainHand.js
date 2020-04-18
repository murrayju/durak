// @flow
import React, { useState } from 'react';
import styled from 'styled-components';

import useGameContext from '../hooks/useGameContext';
import Hand from './Hand';
import Icon from './Icon';
import IconButton from './IconButton';
import PlayerIndicator from './PlayerIndicator';

const Box = styled.div`
  position: absolute;
  bottom: -50px;
  width: 100%;
`;

const MainHandIndicators = styled.div`
  position: fixed;
  bottom: 0;
  left: 10px;
  font-size: 3em;
  display: flex;
  flex-flow: row;
  align-items: center;
  padding: 10px;
`;

const Actions = styled.div`
  position: absolute;
  bottom: 100px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.brand.danger};
  font-size: 2rem;
  padding: 0 15px;
`;

const MainHand = () => {
  const { clientId, gameState, playCards } = useGameContext();
  const [selectedCards, setSelectedCards] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const { players, turn } = gameState;
  const player = players.find((p) => p.id === clientId) || players[turn];
  const defender = gameState.relativePlayer(1, turn);
  const isDefender = player === defender;

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
      <Hand
        primary
        canDrag
        hand={player.hand}
        selected={selectedCards}
        onCardClick={(c) =>
          setSelectedCards((sel) =>
            sel.find((s) => s.id === c.id) ? sel.filter((s) => s.id !== c.id) : [...sel, c],
          )
        }
      />
      <MainHandIndicators>
        <PlayerIndicator player={player} />
        {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
      </MainHandIndicators>
      {!isDefender && selectedCards.length > 0 ? (
        <Actions>
          <IconButton text onClick={attack}>
            <Icon name="dragon" />
            Attack
          </IconButton>
        </Actions>
      ) : null}
    </Box>
  );
};

export default MainHand;
