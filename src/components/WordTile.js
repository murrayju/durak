// @flow
import React from 'react';
import styled from 'styled-components';

import Icon from './Icon';
import { bsTheme } from './Layout';
import type { TileType, Role } from '../api/Game';

const portraitColors = {
  red: bsTheme.game.spyRed,
  blue: bsTheme.game.spyBlue,
  assassin: bsTheme.game.spyBlack,
  bystander: bsTheme.game.portraitBystander,
  unknown: bsTheme.game.portraitUnknown,
};

const portraitIcons = {
  red: 'user-secret',
  blue: 'user-secret',
  assassin: 'user-ninja',
  bystander: 'user',
  unknown: 'user',
};

const borderColors = {
  red: bsTheme.game.spyRed,
  blue: bsTheme.game.spyBlue,
  assassin: bsTheme.game.spyBlack,
  bystander: bsTheme.game.cardDark,
  unknown: bsTheme.game.cardDark,
};

const Tile = styled.div`
  background-color: ${({ theme, revealed, type }) =>
    revealed ? portraitColors[type] : theme.game.cardLight};
  ${({ image }) =>
    image
      ? `
    background-image: url('${image}');
    background-repeat: no-repeat;
    background-position: center center;
    background-origin: border-box;
    background-clip: border-box;
    background-size: cover;
    box-shadow: 5px 5px 5px #666;
  `
      : ''};
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin: 5px;
  padding: 10px;
  width: 325px;
  height: calc(325px * 4 / 7);
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'arrow')};
`;

const InnerTile = styled.div`
  display: flex;
  flex-flow: column;
  background-color: ${({ theme }) => theme.game.cardLight};
  border: 4px solid ${({ type }) => borderColors[type]};
  border-radius: 5px;
  height: 100%;
  padding: 5px;
`;

const Top = styled.div`
  display: flex;
  min-height: 100px;
  position: relative;
  flex-flow: column;
  align-items: center;
  flex: 1 1;
`;

const Person = styled.div`
  display: flex;
  align-items: end;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 5px;
  background-color: ${({ theme }) => theme.game.portraitBackground};
  border: 1px solid ${({ theme }) => theme.game.portraitBorder};
  padding: 5px;

  > i {
    color: ${({ type }) => portraitColors[type]};
    font-size: 6em;
    padding: 0;
    margin: 0;
  }
`;

const WordBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0;
  background-color: #dbe0fd;
  border: 2px solid #f3ebe9;
  border-radius: 4px;
  width: 100%;
  padding: 10px 5px;
`;

const Word = styled.span`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: -5px;
`;

type DefaultProps = {|
  type: TileType,
  image: ?string,
|};

type Props = {
  ...DefaultProps,
  word: string,
  revealed: boolean,
  role: Role,
  onChoose: ?Function,
};

const WordTile = ({ word, type, revealed, image, role, onChoose }: Props) => {
  const isSpymaster = role === 'spymaster';
  const shownType = isSpymaster ? type : 'unknown';
  return revealed && image ? (
    <Tile image={image} type={type} revealed />
  ) : (
    <Tile onClick={isSpymaster ? null : onChoose}>
      <InnerTile type={shownType}>
        <Top>
          <Icon css="color: #f7e6d6;" name="circle" />
          <Person type={shownType}>
            <Icon name={portraitIcons[shownType]} />
          </Person>
        </Top>
        <WordBox>
          <Word>{word.toUpperCase()}</Word>
        </WordBox>
      </InnerTile>
    </Tile>
  );
};
WordTile.defaultProps = ({
  type: 'unknown',
  image: null,
}: DefaultProps);

export default WordTile;
