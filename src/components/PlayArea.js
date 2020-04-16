// @flow
import React from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';

import type GameState from '../api/GameState';
import Hand from './Hand';
import CardComponent from './Card';

const Box = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.game.darkGreen};
  border-radius: 20px;
  background-color: ${({ theme }) => theme.game.pokerGreen};
  width: 1000px;
  height: 800px;
  position: relative;
`;

const TrumpCard = styled(CardComponent)`
  transform: rotate(90deg);
  position: absolute;
  top: 30px;
  right: 80px;
`;

const DrawPile = styled(Hand)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

type Props = {
  gameState: GameState,
};

const PlayArea = ({ gameState }: Props) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'card',
    drop: dropped => console.log('dropped', dropped),
    hover: item => console.log('hovering', item),
    canDrop: () => true,
    collect: mon => ({
      isOver: !!mon.isOver(),
      canDrop: !!mon.canDrop(),
    }),
  });

  return (
    <Box ref={drop}>
      <TrumpCard card={gameState.trumpCard} inDeck />
      <DrawPile hand={gameState.deck} deck />
      {isOver && 'hovering'}
    </Box>
  );
};

export default PlayArea;
