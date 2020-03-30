// @flow
import React from 'react';
import styled from 'styled-components';

import type { Player, GameState } from '../api/Game';
import WordTile from './WordTile';

const Board = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  max-width: 1750px;
  align-items: center;
  justify-content: center;

  > * {
    flex: 0 0 auto;
  }
`;

const PreloadImages = styled.div`
  background: ${({ urls }) => urls.map(url => `url('${url}')`).join(', ')};
`;

type Props = {
  player: Player,
  gameState: GameState,
  onTileSelected: (index: number) => void,
};

const WordBoard = ({ player, gameState, onTileSelected }: Props) => {
  if (!gameState) {
    return null;
  }
  const { words, key, revealTileImages, revealed } = gameState;
  return (
    <Board>
      {words?.map((word, i) => (
        <WordTile
          key={word}
          word={word}
          role={player.role}
          type={key?.[i] || 'unknown'}
          image={revealTileImages?.[i] || null}
          revealed={revealed?.[i] || false}
          onChoose={() => onTileSelected(i)}
        />
      ))}
      <PreloadImages urls={revealTileImages} />
    </Board>
  );
};

export default WordBoard;
