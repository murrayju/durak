// @flow
import { useState, useEffect } from 'react';

import useFetch from './useFetch';

const useVersion = () => {
  const { fetch } = useFetch();
  const [version, setVersion] = useState('');

  useEffect(() => {
    fetch('/api/version', {
      method: 'GET',
    })
      .then((r) => r.json())
      .then(({ info: v }) => setVersion(v));
  }, [fetch]);

  return [version];
};

export default useVersion;
