// @flow
import React from 'react';
import styled from 'styled-components';

import type Card from '../api/Card';

// const cardRatio = 240 / 336;

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
  card: Card,
  selected?: boolean,
  onCardClick?: ?(Card) => void,
  primary?: ?boolean,
};

const CardComponent = ({ card, selected, onCardClick, primary }: Props) => {
  return (
    <CardImg
      primary={primary}
      alt={card.name}
      src={card.imageUrl}
      onClick={onCardClick ? () => onCardClick(card) : null}
      selected={selected}
    />
  );
};
CardComponent.defaultProps = {
  selected: false,
  onCardClick: null,
  primary: false,
};

export default CardComponent;
