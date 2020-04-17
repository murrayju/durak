// @flow
import { useContext } from 'react';

import GameContext from '../contexts/GameContext';

const useGameContext = () => {
  return useContext(GameContext);
};

export default useGameContext;
