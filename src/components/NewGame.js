// @flow
import React, { useState, useEffect } from 'react';

import history from '../history';
import useFetch from '../hooks/useFetch';
import Loading from './Loading';
import NotFound from './NotFound';

const NewGame = () => {
  const { fetch } = useFetch();
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
