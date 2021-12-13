// @flow
import React from 'react';
import type { Node as ReactNode } from 'react';

import Layout from './Layout';

type Props = {
  children: ReactNode,
};
const App = function ({ children }: Props) {
  return <Layout container>{children}</Layout>;
};
export default App;
