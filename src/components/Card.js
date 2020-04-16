// @flow
import React from 'react';
import styled from 'styled-components';
import { useDrag } from 'react-dnd';

import type Card from '../api/Card';

// const cardRatio = 240 / 336;

const CardImg = styled.img`
  position: relative;
  margin-top: ${({ inDeck, selected, dragging }) =>
    inDeck ? 0 : selected || dragging ? '-350px' : '-250px'};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : null)};
  width: 70px;
  top: ${({ inDeck }) => (inDeck ? null : '60px')};
  transform: ${({ primary }) => (primary ? 'scale(1.5);' : null)};
  ${({ dragging }) =>
    dragging
      ? {
          border: '2px solid red',
          'border-radius': '9px',
        }
      : null};

  &:not(:first-child) {
    margin-left: ${({ inDeck, primary }) => (inDeck ? '-69px' : primary ? '-50px;' : '-65px;')};
    margin-top: ${({ inDeck, index }) => (inDeck ? `${index}px` : null)};
  }

  @media (min-width: ${({ theme }) => theme.screen.smMin}) {
    width: 100px;
    top: ${({ inDeck }) => (inDeck ? null : '50px')};
    &:not(:first-child) {
      margin-left: ${({ inDeck, primary }) => (inDeck ? '-99px' : primary ? '-75px;' : '-92px;')};
      margin-top: ${({ inDeck, index }) => (inDeck ? `${index}px` : null)};
    }
  }

  @media (min-width: ${({ theme }) => theme.screen.lgMin}) {
    width: 146px;
    top: ${({ inDeck }) => (inDeck ? null : '40px')};
    &:not(:first-child) {
      margin-left: ${({ inDeck, primary }) =>
        inDeck ? '-145px' : primary ? '-100px;' : '-135px;'};
      margin-top: ${({ inDeck, index }) => (inDeck ? `${index}px` : null)};
    }
  }
`;

type Props = {
  card: Card,
  index?: number,
  selected?: boolean,
  onCardClick?: ?(Card) => void,
  primary?: ?boolean,
  inDeck?: ?boolean,
  canDrag?: ?boolean,
  className?: string,
};

const CardComponent = ({
  card,
  index,
  selected,
  onCardClick,
  primary,
  inDeck,
  canDrag,
  className,
}: Props) => {
  const [{ isDragging }, drag] = useDrag({
    item: { type: 'card', id: card.id },
    canDrag: () => canDrag,
    collect: mon => ({
      isDragging: !!mon.isDragging(),
    }),
  });

  return (
    <CardImg
      ref={drag}
      index={index}
      primary={primary}
      inDeck={inDeck}
      alt={card.name}
      src={card.imageUrl}
      onClick={onCardClick ? () => onCardClick(card) : null}
      selected={selected}
      dragging={isDragging}
      className={className}
    />
  );
};
CardComponent.defaultProps = {
  index: 0,
  selected: false,
  onCardClick: null,
  primary: false,
  inDeck: false,
  canDrag: false,
  className: '',
};

export default CardComponent;
