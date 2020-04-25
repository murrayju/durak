// @flow
import React from 'react';

import useTableApi from '../hooks/useTableApi';
import TableContext from '../contexts/TableContext';
import GameBoard from './GameBoard';
import TableLobby from './TableLobby';
import Loading from './Loading';
import NotFound from './NotFound';
import JoinTable from './JoinTable';
import GameHeading from './GameHeading';
import PreloadDeckImages from './PreloadDeckImages';

type Props = {
  id: string,
};

const Table = ({ id }: Props) => {
  const tableContext = useTableApi(id);
  const { table, notFound, client, gameState } = tableContext;

  return table?.state ? (
    <TableContext.Provider value={tableContext}>
      <GameHeading />
      {!client?.joined ? <JoinTable /> : gameState.gameStarted ? <GameBoard /> : <TableLobby />}
      <PreloadDeckImages />
    </TableContext.Provider>
  ) : notFound ? (
    <NotFound />
  ) : (
    <Loading what="table data" />
  );
};

export default Table;
