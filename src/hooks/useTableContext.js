// @flow
import { useContext } from 'react';

import TableContext from '../contexts/TableContext';

const useTableContext = () => {
  return useContext(TableContext);
};

export default useTableContext;
