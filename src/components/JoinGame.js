// @flow
import React, { useContext, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Form, FormGroup, Col, FormControl, ControlLabel, Button } from 'react-bootstrap';

import AppContext from '../contexts/AppContext';
import type { Player } from '../api/Game';

type Props = {
  id: string,
  clientId: string,
};

const Game = ({ id, clientId }: Props) => {
  const { fetch } = useContext(AppContext);
  const [isSubmitting, setSubmitting] = useState(false);
  const [cookies, setCookie] = useCookies();
  const [playerInfo, setPlayerInfo] = useState<Player>({
    id: clientId,
    name: cookies.codenames_name || '',
    role: 'operative',
    team: Math.random() > 0.5 ? 'red' : 'blue',
  });

  const submit = evt => {
    if (isSubmitting) {
      return;
    }
    setSubmitting(true);
    evt.preventDefault();
    fetch(`/api/game/${id}/join`, {
      method: 'POST',
      body: JSON.stringify(playerInfo),
    })
      .then(r => r.json())
      .finally(() => setSubmitting(false));
  };

  return (
    <Form horizontal noValidate autoComplete="off" onSubmit={submit}>
      <h1>Join Game: {id}</h1>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>
          Name
        </Col>
        <Col sm={9}>
          <FormControl
            type="text"
            placeholder="Name"
            value={playerInfo.name}
            onChange={({ currentTarget: { value: name } }) => {
              setCookie('codenames_name', name, { path: '/' });
              setPlayerInfo(p => ({ ...p, name }));
            }}
            disabled={isSubmitting}
          />
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>
          Team
        </Col>
        <Col sm={9}>
          {['red', 'blue'].map(m => (
            <label key={m} htmlFor={m} css="padding-left: 10px;">
              <input
                css="&& { margin-right: 5px; }"
                type="radio"
                id={m}
                value={m}
                checked={playerInfo.team === m}
                onChange={({ currentTarget: { value: team } }) => {
                  setPlayerInfo(p => ({ ...p, team }));
                }}
              />
              {m}
            </label>
          ))}
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>
          Role
        </Col>
        <Col sm={9}>
          {['spymaster', 'operative'].map(m => (
            <label key={m} htmlFor={m} css="padding-left: 10px;">
              <input
                css="&& { margin-right: 5px; }"
                type="radio"
                id={m}
                value={m}
                checked={playerInfo.role === m}
                onChange={({ currentTarget: { value: role } }) => {
                  setPlayerInfo(p => ({ ...p, role }));
                }}
              />
              {m}
            </label>
          ))}
        </Col>
      </FormGroup>
      <FormGroup>
        <Col smOffset={3} sm={9}>
          <Button type="submit" disabled={isSubmitting}>
            Join Game
          </Button>
        </Col>
      </FormGroup>
    </Form>
  );
};

export default Game;
