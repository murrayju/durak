// @flow
import { useState, useEffect } from 'react';

import useFetch from './useFetch';

const useDeckImages = () => {
  const { fetch } = useFetch();
  const [deckImgMap, setDeckImgMap] = useState({});

  useEffect(() => {
    fetch(`/api/deck/imgMap`, {
      method: 'GET',
    })
      .then((r) => r.json())
      .then(setDeckImgMap)
      .catch((err) => {
        console.error('Failed to get deck image map.', err);
      });
  }, [fetch]);

  return deckImgMap;
};

export default useDeckImages;
