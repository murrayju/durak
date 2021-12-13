// @flow
import React from 'react';
import styled from 'styled-components';

import CardComponent from './Card';
import type Deck from '../api/Deck';
import type Card from '../api/Card';

// const cardRatio = 240 / 336;

const Box = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  overflow: visible;
  transform: ${({ rotate }) => rotate && `rotate(${rotate})`};

  > * {
    flex: 0 0 auto;
  }
`;

type Props = {
  hand: Deck,
  selected?: ?(Card[]),
  onCardClick?: ?(Card) => void,
  primary?: ?boolean,
  canDrag?: ?boolean,
  deck?: ?boolean,
  disheveled?: ?boolean,
  rotate?: ?string,
  className?: string,
};

const Hand = function ({
  hand,
  selected,
  onCardClick,
  primary,
  canDrag,
  deck,
  disheveled,
  rotate,
  className,
}: Props) {
  const { cards } = hand.sort();
  return (
    <Box className={className} rotate={rotate}>
      {cards.map((c, i) => (
        <CardComponent
          key={c.id}
          card={c}
          index={i}
          primary={primary}
          canDrag={canDrag}
          onCardClick={onCardClick}
          selected={!!selected?.find((s) => s.id === c.id)}
          inDeck={deck}
          disheveled={disheveled}
        />
      ))}
    </Box>
  );
};
Hand.defaultProps = {
  selected: null,
  onCardClick: null,
  primary: false,
  canDrag: false,
  deck: false,
  disheveled: false,
  rotate: null,
  className: '',
};

export default Hand;
