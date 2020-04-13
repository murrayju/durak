// @flow
import React, { useContext, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Form, FormGroup, Col, FormControl, ControlLabel, Button } from 'react-bootstrap';
import styled from 'styled-components';

import AppContext from '../contexts/AppContext';
import type { Client } from '../api/Game';

const Box = styled.div`
  flex: 1 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type Props = {
  id: string,
  clientId: string,
};

const JoinGame = ({ id, clientId }: Props) => {
  const { fetch } = useContext(AppContext);
  const [isSubmitting, setSubmitting] = useState(false);
  const [cookies, setCookie] = useCookies();
  const [playerInfo, setPlayerInfo] = useState<Client>({
    id: clientId,
    name: cookies.durak_name || '',
  });

  const valid = !!playerInfo.name;

  const submit = evt => {
    if (!valid || isSubmitting) {
      return;
    }
    setSubmitting(true);
    evt.preventDefault();
    fetch(`/api/game/${id}/join`, {
      method: 'POST',
      body: JSON.stringify(playerInfo),
    }).finally(() => setSubmitting(false));
  };

  return (
    <Box>
      <Form horizontal noValidate autoComplete="off" onSubmit={submit}>
        <h1>
          <small>joining game:</small> {id}
        </h1>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            player name
          </Col>
          <Col sm={9}>
            <FormControl
              type="text"
              placeholder="Name"
              value={playerInfo.name}
              onChange={({ currentTarget: { value: name } }) => {
                setCookie('durak_name', name, { path: '/' });
                setPlayerInfo(p => ({ ...p, name }));
              }}
              disabled={isSubmitting}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col smOffset={3} sm={9}>
            <Button type="submit" disabled={!valid || isSubmitting}>
              Join Game
            </Button>
          </Col>
        </FormGroup>
      </Form>
    </Box>
  );
};

export default JoinGame;
