// @flow
import React, { useContext, useState, useEffect } from 'react';

import history from '../history';
import AppContext from '../contexts/AppContext';
import Loading from './Loading';
import NotFound from './NotFound';

const NewGame = () => {
  const { fetch } = useContext(AppContext);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/game`, {
      method: 'POST',
    })
      .then(r => r.json())
      .then(game => history.push(`/game/${game.id}`))
      .catch(() => setNotFound(true));
  }, [fetch]);
  return notFound ? <NotFound /> : <Loading what="new game" />;
};

export default NewGame;
