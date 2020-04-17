// @flow
import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import { Form, FormGroup, Col, FormControl, ControlLabel, Button } from 'react-bootstrap';
import styled from 'styled-components';

import useGameContext from '../hooks/useGameContext';

const Box = styled.div`
  flex: 1 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const JoinGame = () => {
  const { id, join, clientId } = useGameContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [cookies, setCookie] = useCookies();
  const [playerName, setPlayerName] = useState(cookies.durak_name || '');
  const valid = !!playerName;

  const submit = evt => {
    if (!valid || isSubmitting) {
      return;
    }
    setSubmitting(true);
    evt.preventDefault();
    join({
      id: clientId,
      name: playerName,
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
              value={playerName}
              onChange={({ currentTarget: { value: name } }) => {
                setCookie('durak_name', name, { path: '/' });
                setPlayerName(name);
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
