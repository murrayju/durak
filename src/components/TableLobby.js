// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';

import useTableContext from '../hooks/useTableContext';
import ConnectionIndicator from './ConnectionIndicator';

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

const TableLobby = function () {
  const { newRound, clients } = useTableContext();
  const [isSubmitting, setSubmitting] = useState(false);

  const submit = (evt) => {
    if (isSubmitting) {
      return;
    }
    setSubmitting(true);
    evt.preventDefault();
    newRound().finally(() => setSubmitting(false));
  };

  const joinedClients = clients.filter((c) => c.joined && c.name);

  return (
    <Box>
      <Button onClick={submit} disabled={joinedClients.length < 2 || isSubmitting}>
        Start Game
      </Button>
      <PlayersBox>
        <h3>Connected Players</h3>
        {joinedClients.map(
          (c) =>
            c.name && (
              <div key={c.id}>
                <ConnectionIndicator what={`${c.name} is`} connected={c.connected || false} />{' '}
                {c.name}
              </div>
            ),
        )}
      </PlayersBox>
    </Box>
  );
};

export default TableLobby;
