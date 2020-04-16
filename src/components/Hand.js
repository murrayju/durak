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
  deck?: ?boolean,
  className?: string,
};

const Hand = ({ hand, selected, onCardClick, primary, deck, className }: Props) => {
  const { cards } = hand.sort();
  return (
    <Box className={className}>
      {cards.map((c, i) => (
        <CardComponent
          key={c.id === 'X:X' ? `X:X:${i}` : c.id}
          card={c}
          index={i}
          primary={primary}
          onCardClick={onCardClick}
          selected={!!selected?.find(s => s.id === c.id)}
          inDeck={deck}
        />
      ))}
    </Box>
  );
};
Hand.defaultProps = {
  selected: null,
  onCardClick: null,
  primary: false,
  deck: false,
  className: '',
};

export default Hand;
