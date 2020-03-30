// @flow
import React from 'react';
import styled from 'styled-components';

import type { Player, GameState } from '../api/Game';
import WordTile from './WordTile';

// const BoardWrapper = styled.div`
//   width: 100%;
//   max-width: 1750px;
//   padding-top: 57.14%;
//   position: relative;
// `;

// const Board = styled.div`
//   display: grid;
//   position: absolute;
//   top: 0;
//   bottom: 0;
//   left: 0;
//   right: 0;
//   align-content: stretch;
//   justify-content: stretch;
//   grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
//   grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
//   row-gap: 5px;
//   column-gap: 5px;
// `;
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
    </Board>
  );
};

export default WordBoard;
