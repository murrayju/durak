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
  transform: ${({ primary, disheveled, idNum }) =>
    `${primary ? 'scale(1.5)' : ''} ${
      disheveled
        ? `rotate(${13 * idNum}deg) translate(${((idNum - 26) * 77) % 50}px, ${
            ((idNum - 26) * 17) % 50
          }px)`
        : ''
    }`};
  ${({ dragging }) =>
    dragging
      ? {
          border: '2px solid red',
          'border-radius': '9px',
        }
      : null};

  &:not(:first-child) {
    margin-left: ${({ inDeck, primary }) => (inDeck ? '-69.5px' : primary ? '-50px;' : '-65px;')};
    margin-top: ${({ inDeck, index }) => (inDeck ? `${index * 0.5}px` : null)};
  }

  @media (min-width: ${({ theme }) => theme.screen.smMin}) {
    width: 100px;
    top: ${({ inDeck }) => (inDeck ? null : '50px')};
    &:not(:first-child) {
      margin-left: ${({ inDeck, primary }) =>
        inDeck ? '-99.25px' : primary ? '-75px;' : '-92px;'};
      margin-top: ${({ inDeck, index }) => (inDeck ? `${index * 0.75}px` : null)};
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
  disheveled?: ?boolean,
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
  disheveled,
  canDrag,
  className,
}: Props) => {
  const [{ isDragging }, drag] = useDrag({
    item: { type: 'card', id: card.id },
    canDrag: () => canDrag,
    collect: (mon) => ({
      isDragging: !!mon.isDragging(),
    }),
  });

  return (
    <CardImg
      ref={drag}
      index={index}
      idNum={parseInt(card.idNum, 10)}
      disheveled={disheveled}
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
  disheveled: false,
  canDrag: false,
  className: '',
};

export default CardComponent;
