// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';

import useGameContext from '../hooks/useGameContext';

const Box = styled.div`
  flex: 1 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column;
`;

const PlayersBox = styled.div`
  margin-top: 10px;
`;

const GameLobby = () => {
  const { newRound, clients } = useGameContext();
  const [isSubmitting, setSubmitting] = useState(false);

  const submit = (evt) => {
    if (isSubmitting) {
      return;
    }
    setSubmitting(true);
    evt.preventDefault();
    newRound().finally(() => setSubmitting(false));
  };

  return (
    <Box>
      <Button onClick={submit} disabled={clients.length < 2 || isSubmitting}>
        Start Game
      </Button>
      <PlayersBox>
        <h3>Connected Players</h3>
        <ul>
          {clients.map((c) => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>
      </PlayersBox>
    </Box>
  );
};

export default GameLobby;
