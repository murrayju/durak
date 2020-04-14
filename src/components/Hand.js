// @flow
import React from 'react';
import styled from 'styled-components';

import type Deck from '../api/Deck';
import type Card from '../api/Card';

const cardRatio = 240 / 336;

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

const CardImg = styled.img`
  position: relative;
  margin-top: ${({ selected }) => (selected ? '-350px' : '-250px')};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : null)};
  width: 70px;
  top: 60px;
  ${({ primary }) => {
    return primary ? 'transform: scale(1.5);' : '';
  }};

  &:not(:first-child) {
    ${({ primary }) => {
      return primary ? 'margin-left: -50px;' : 'margin-left: -65px;';
    }};
  }

  @media (min-width: ${({ theme }) => {
      return theme.screen.smMin;
    }}) {
    width: 100px;
    top: 50px;
    &:not(:first-child) {
      ${({ primary }) => {
        return primary ? 'margin-left: -75px;' : 'margin-left: -92px;';
      }};
    }
  }

  @media (min-width: ${({ theme }) => {
      return theme.screen.lgMin;
    }}) {
    width: 146px;
    top: 40px;
    &:not(:first-child) {
      ${({ primary }) => {
        return primary ? 'margin-left: -100px;' : 'margin-left: -135px;';
      }};
    }
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
      {cards.map(c => (
        <CardImg
          key={c.id}
          primary={primary}
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
  primary: false,
};

export default Hand;
