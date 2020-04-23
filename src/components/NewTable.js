// @flow
import React, { useState, useEffect } from 'react';

import history from '../history';
import useFetch from '../hooks/useFetch';
import Loading from './Loading';
import NotFound from './NotFound';

const NewTable = () => {
  const { fetch } = useFetch();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/table`, {
      method: 'POST',
    })
      .then((r) => r.json())
      .then((table) => history.push(`/table/${table.id}`))
      .catch(() => setNotFound(true));
  }, [fetch]);
  return notFound ? <NotFound /> : <Loading what="new table" />;
};

export default NewTable;
