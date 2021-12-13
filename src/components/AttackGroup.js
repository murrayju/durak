// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';

import useTableContext from '../hooks/useTableContext';
import CardComponent from './Card';
import Card from '../api/Card';

const Box = styled.div``;

const AttackCard = styled(CardComponent)`
  position: static;
  margin: 0;
`;
const DefenseCard = styled(CardComponent)`
  position: static;
  margin-top: 65px;
`;
const HoverDefenseCard = styled(DefenseCard)`
  opacity: 0.5;
`;

type Props = {
  attack: Card,
  defense?: ?Card,
  className?: string,
};

const AttackGroup = function ({ attack, defense, className }: Props) {
  const { clientId, gameState, playCards, selectedCards, setSelectedCards, setErrorMsg } =
    useTableContext();
  const isDefender = gameState.isDefender(clientId);
  const [hoverCard, setHoverCard] = useState(null);
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'card',
    drop: ({ id }) => {
      setErrorMsg(null);
      playCards({
        type: 'defend',
        cards: [
          {
            id,
            target: attack.id,
          },
        ],
      }).then(
        () => setSelectedCards([]),
        (err) => {
          setErrorMsg(err.message.replace('Fetch failed: ', ''));
          setSelectedCards([]);
        },
      );
    },
    hover: ({ id }) => setHoverCard(Card.deserialize(id)),
    canDrop: () => isDefender,
    collect: (mon) => ({
      isOver: !!mon.isOver(),
      canDrop: !!mon.canDrop(),
    }),
  });

  const defend = (targetCard: Card) => {
    setErrorMsg(null);
    playCards({
      type: 'defend',
      cards: selectedCards.map(({ id }) => ({
        id,
        target: targetCard.id,
      })),
    }).then(
      () => setSelectedCards([]),
      (err) => {
        setErrorMsg(err.message.replace('Fetch failed: ', ''));
        setSelectedCards([]);
      },
    );
  };

  return (
    <Box ref={drop} className={className}>
      <AttackCard card={attack} onCardClick={isDefender ? defend : null} />
      {defense ? (
        <DefenseCard card={defense} />
      ) : canDrop && isOver && hoverCard ? (
        <HoverDefenseCard card={hoverCard} />
      ) : null}
    </Box>
  );
};
AttackGroup.defaultProps = {
  defense: null,
  className: '',
};

export default AttackGroup;
