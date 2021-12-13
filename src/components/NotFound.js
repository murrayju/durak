// @flow
import React from 'react';
import { Grid } from 'react-bootstrap';

type Props = {
  title?: string,
  detail?: string,
};

const NotFound = function ({ title, detail }: Props) {
  return (
    <Grid>
      <h1>{title}</h1>
      <p>Sorry, the page you were trying to view does not exist.</p>
      {detail ? <p>{detail}</p> : null}
    </Grid>
  );
};
NotFound.defaultProps = {
  title: 'Page Not Found',
  detail: '',
};

export default NotFound;
