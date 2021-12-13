// @flow
import React from 'react';
import type { Node as ReactNode } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { position, darken } from 'polished';

// external-global styles must be imported in your JS.
import Footer from './Footer';

// used by styled-components
// this should match the values in aura
export const bsTheme = {
  table: {
    pokerGreen: '#477148',
    darkGreen: darken(0.5, '#477148'),
    gold: '#CFB53B',
  },
  brand: {
    primary: '#337ab7', // DMA Light blue
    primaryDark: '#0962ac', // DMA Dark blue
    success: '#5cb85c', // DMA A green we use sometimes, subject to change.
    info: '#5bc0de',
    warning: '#f0ad4e', // DMA Orange
    danger: '#d9534f', // DMA Red
    black: '#000', // Used for text and other elements
    gray1: '#222', // Used for icons and secondary text
    gray2: '#333', // Used for watermarks and dark borders
    gray3: '#555', // Used for light borders
    gray4: '#777', // Used for off-white backgrounds
    gray5: '#eee', // Used for button gradients and almost white objects
    white: '#fff',
  },
  primaryGradient: {
    start: '#0962ac',
    mid: '#71a3cc',
    end: '#e2eaf0',
  },
  screen: {
    xsMax: '767.98px',
    smMin: '768px',
    smMax: '1169.98px',
    mdMin: '1170px',
    mdMax: '1694.98px',
    lgMin: '1695px',
    smMinHt: '420px',
    mdMinHt: '720px',
    lgMinHt: '1000px',
  },
};

const PageRoot = styled.div`
  ${position('fixed', 0, 0, 0, 0)};
  width: 100%;
  background-color: ${({ theme }) => theme.brand.gray5};
  display: flex;
`;

const ContentRoot = styled.div`
  display: flex;
  flex: 1 1;
  flex-flow: column;
  align-items: center;
`;

type Props = {
  children: ReactNode,
};

const Layout = function ({ children }: Props) {
  return (
    <ThemeProvider theme={bsTheme}>
      <PageRoot>
        <Footer />
        <ContentRoot>{children}</ContentRoot>
      </PageRoot>
    </ThemeProvider>
  );
};

export default Layout;
