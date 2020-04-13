// @flow
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { Form, FormGroup, Col, Button } from 'react-bootstrap';

import AppContext from '../contexts/AppContext';
import type { Client } from '../api/Game';

const Box = styled.div`
  flex: 1 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column;
`;

const PlayersBox = styled.div`
  flex: 1 1;
  display: flex;
  align-items: start;
  flex-flow: column;
`;

type Props = {
  id: string,
  clients: Client[],
};

const GameLobby = ({ id, clients }: Props) => {
  const { fetch } = useContext(AppContext);
  const [isSubmitting, setSubmitting] = useState(false);

  const submit = evt => {
    if (isSubmitting) {
      return;
    }
    setSubmitting(true);
    evt.preventDefault();
    fetch(`/api/game/${id}/newRound`, {
      method: 'POST',
    }).finally(() => setSubmitting(false));
  };

  return (
    <Box>
      <Button onClick={submit} disabled={isSubmitting}>
        Start Game
      </Button>
      <PlayersBox>
        <h3>Connected Players</h3>
        <ul>
          {clients.map(c => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>
      </PlayersBox>
    </Box>
  );
};

export default GameLobby;
