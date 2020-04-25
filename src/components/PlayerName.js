// @flow
import styled from 'styled-components';

const PlayerName = styled.div`
  white-space: nowrap;
  margin-top: 0.5em;
  font-size: 1em;
  @media (min-width: ${({ theme }) => theme.screen.smMin}) {
    font-size: 1.2em;
  }
  @media (min-width: ${({ theme }) => theme.screen.lgMin}) {
    font-size: 1.5em;
  }
`;

export default PlayerName;
