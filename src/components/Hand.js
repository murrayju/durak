// @flow
import { Reorder } from 'framer-motion';
import React, { useCallback, useMemo } from 'react';
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

const ConditionalWrapper = ({ condition, wrapper, children }) =>
  condition ? wrapper({ children }) : children;

type Props = {
  hand: Deck,
  selected?: ?(Card[]),
  onCardClick?: ?(Card) => void,
  onReorder?: ?(string[]) => void,
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
  onReorder,
  primary,
  canDrag,
  deck,
  disheveled,
  rotate,
  className,
}: Props) {
  const { cards } = hand;
  const cardIds = useMemo(() => cards.map((card) => card.id), [cards]);

  const ReorderGroup = useCallback(
    ({ children }) => (
      <Reorder.Group as="div" axis="x" values={cardIds} onReorder={onReorder}>
        {children}
      </Reorder.Group>
    ),
    [cardIds, onReorder],
  );

  const makeCardWrapper = useCallback(
    (children, id) => (
      <Reorder.Item
        as="span"
        value={id}
        drag
        style={{ display: 'inline-block', position: 'relative', marginLeft: -63 }}
      >
        {children}
      </Reorder.Item>
    ),
    [],
  );

  return (
    <Box className={className} rotate={rotate}>
      <ConditionalWrapper condition={onReorder} wrapper={ReorderGroup}>
        {cards.map((c, i) => (
          <ConditionalWrapper
            key={c.id}
            condition={onReorder}
            wrapper={({ children }) => makeCardWrapper(children, c.id)}
          >
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
          </ConditionalWrapper>
        ))}
      </ConditionalWrapper>
    </Box>
  );
};
Hand.defaultProps = {
  selected: null,
  onCardClick: null,
  onReorder: null,
  primary: false,
  canDrag: false,
  deck: false,
  disheveled: false,
  rotate: null,
  className: '',
};

export default Hand;
