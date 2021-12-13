// @flow
import React from 'react';
import styled from 'styled-components';

import Icon from './Icon';
import useVersion from '../hooks/useVersion';

const Box = styled.div`
  display: flex;
  flex-flow: column;
  align-items: end;
  position: fixed;
  bottom: 5px;
  right: 10px;
  color: rgba(0, 0, 0, 0.5);

  > h3 {
    margin-bottom: 0;
  }
`;

const Footer = function () {
  const [version] = useVersion();

  return (
    <Box>
      <h3>
        <Icon name="beer" /> Durak
      </h3>
      <div>
        {version ? <small>v{version} </small> : null}
        <small>&copy; 2020 Justin Murray</small>
      </div>
    </Box>
  );
};

export default Footer;
