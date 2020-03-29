// @flow
import React from 'react';
import styled from 'styled-components';

import Icon from './Icon';
import useVersion from '../hooks/useVersion';

const Box = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
`;

const Footer = () => {
  const [version] = useVersion();

  return (
    <Box>
      <h3>
        <Icon name="search" />
        C0D3N4M3S
      </h3>
      <p>Copyright 2020 Justin Murray</p>
      {version ? <small>v{version}</small> : null}
    </Box>
  );
};

export default Footer;
