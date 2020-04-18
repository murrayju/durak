// @flow
import React from 'react';
import styled from 'styled-components';
import { position } from 'polished';
import { useDrop } from 'react-dnd';

import useGameContext from '../hooks/useGameContext';
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

  ${position('absolute', 65, 60, 100, 60)}
  @media (min-width: ${({ theme }) => theme.screen.smMin}) {
    ${position('absolute', 95, 100, 150, 100)}
  }
  @media (min-width: ${({ theme }) => theme.screen.lgMin}) {
    ${position('absolute', 120, 140, 210, 140)}
  }
`;

const AttackArea = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const AttackGroup = styled.div``;

const AttackCard = styled(CardComponent)`
  position: static;
  margin: 0;
`;
const DefenseCard = styled(CardComponent)``;

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

const PlayArea = () => {
  const { gameState } = useGameContext();
  const [{ isOver }, drop] = useDrop({
    accept: 'card',
    drop: (dropped) => console.log('dropped', dropped),
    hover: (item) => console.log('hovering', item),
    canDrop: () => true,
    collect: (mon) => ({
      isOver: !!mon.isOver(),
      canDrop: !!mon.canDrop(),
    }),
  });

  return (
    <Box>
      <TrumpCard card={gameState.trumpCard} inDeck />
      <DrawPile hand={gameState.deck} deck />
      <AttackArea ref={drop}>
        {gameState.attacks.map(({ attack, defense }) => (
          <AttackGroup>
            <AttackCard card={attack} />
            {defense && <DefenseCard card={defense} />}
          </AttackGroup>
        ))}
        {isOver && 'hovering'}
      </AttackArea>
    </Box>
  );
};

export default PlayArea;
