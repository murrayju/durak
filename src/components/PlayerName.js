// @flow
import styled from 'styled-components';

const PlayerName = styled.div`
  font-size: 1em;
  margin-top: 0.5em;
  @media (min-width: ${({ theme }) => theme.screen.smMin}) {
    font-size: 1.2em;
  }
  @media (min-width: ${({ theme }) => theme.screen.lgMin}) {
    font-size: 1.5em;
  }
`;

export default PlayerName;
