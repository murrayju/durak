// @flow
import React from 'react';
import styled from 'styled-components';

import CardComponent from './Card';
import type Deck from '../api/Deck';
import type Card from '../api/Card';

// const cardRatio = 240 / 336;

const Box = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: nowrap;
  width: 100%;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;

  > * {
    flex: 0 0 auto;
  }
`;

type Props = {
  hand: Deck,
  selected?: ?(Card[]),
  onCardClick?: ?(Card) => void,
  primary?: ?boolean,
};

const Hand = ({ hand, selected, onCardClick, primary }: Props) => {
  const { cards } = hand.sort();
  return (
    <Box>
      {cards.map((c, i) => (
        <CardComponent
          key={c.id === 'X:X' ? `X:X:${i}` : c.id}
          card={c}
          primary={primary}
          onCardClick={onCardClick}
          selected={!!selected?.find(s => s.id === c.id)}
        />
      ))}
    </Box>
  );
};
Hand.defaultProps = {
  selected: null,
  onCardClick: null,
  primary: false,
};

export default Hand;
