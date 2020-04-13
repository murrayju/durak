// @flow
import React from 'react';
import styled from 'styled-components';

import type Deck from '../api/Deck';

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
  margin-top: -250px;
  top: 125px;
  &:not(:first-child) {
    margin-left: -195px;
  }
`;

type Props = {
  hand: Deck,
};

const Hand = ({ hand }: Props) => {
  const { cards } = hand.sort();
  const count = cards.length;
  return (
    <Box>
      {cards.map(c => (
        <CardImg key={c.id} src={c.imageUrl} alt={c.name} />
      ))}
    </Box>
  );
};

export default Hand;
