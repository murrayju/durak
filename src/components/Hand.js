// @flow
import React from 'react';
import styled from 'styled-components';

import type Deck from '../api/Deck';
import type Card from '../api/Card';

const cardRatio = 240 / 336;

const Box = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  align-items: center;
  justify-content: center;
  position: relative;
  /* margin-left: 200px;
  left: -100px; */
  overflow: visible;

  > * {
    flex: 0 0 auto;
  }
`;

const CardImg = styled.img`
  position: relative;
  margin-top: ${({ selected }) => (selected ? '-350px' : '-250px')};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : null)};
  top: 125px;
  &:not(:first-child) {
    margin-left: -195px;
  }
`;

type Props = {
  hand: Deck,
  selected?: ?(Card[]),
  onCardClick?: ?(Card) => void,
};

const Hand = ({ hand, selected, onCardClick }: Props) => {
  const { cards } = hand.sort();
  return (
    <Box>
      {cards.map(c => (
        <CardImg
          key={c.id}
          alt={c.name}
          src={c.imageUrl}
          onClick={onCardClick ? () => onCardClick(c) : null}
          selected={!!selected?.find(s => s.id === c.id)}
        />
      ))}
    </Box>
  );
};
Hand.defaultProps = {
  selected: null,
  onCardClick: null,
};

export default Hand;
