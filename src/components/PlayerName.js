// @flow
import styled from 'styled-components';

const PlayerName = styled.div`
  font-size: 1em;
  margin-top: -10px;

  @media (min-width: ${({ theme }) => {
      return theme.screen.smMin;
    }}) {
    margin-top: 10px;
    font-size: 1.2em;
  }

  @media (min-width: ${({ theme }) => {
      return theme.screen.lgMin;
    }}) {
    margin-top: 25px;
    font-size: 1.5em;
  }
`;

export default PlayerName;
