// @flow
import { useContext } from 'react';

import AppContext from '../contexts/AppContext';

const useFetch = () => {
  const { fetch } = useContext(AppContext);
  return { fetch };
};

export default useFetch;
