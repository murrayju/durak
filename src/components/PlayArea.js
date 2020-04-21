// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { position } from 'polished';
import { useDrop } from 'react-dnd';

import useGameContext from '../hooks/useGameContext';
import Hand from './Hand';
import Icon from './Icon';
import IconButton from './IconButton';
import CardComponent from './Card';
import AttackGroup from './AttackGroup';
import Card from '../api/Card';

const Box = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.game.darkGreen};
  border-radius: 20px;
  background-color: ${({ theme }) => theme.game.pokerGreen};

  ${position('absolute', 65, 60, 100, 60)}
  @media (min-width: ${({ theme }) => theme.screen.smMin}) {
    ${position('absolute', 95, 100, 150, 100)}
  }
  @media (min-width: ${({ theme }) => theme.screen.lgMin}) {
    ${position('absolute', 120, 140, 210, 140)}
  }
`;

const AttackArea = styled.div`
  flex: 0 0;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  z-index: 1;
`;

const TrumpCard = styled(CardComponent)`
  transform: rotate(90deg);
  position: absolute;
  top: 13px;
  right: 40px;
  @media (min-width: ${({ theme }) => theme.screen.smMin}) {
    top: 17px;
    right: 60px;
  }
  @media (min-width: ${({ theme }) => theme.screen.lgMin}) {
    top: 20px;
    right: 80px;
  }
`;

const TrumpIndicator = styled.div`
  position: absolute;
  top: 10px;
  right: 55px;
  font-size: 5em;
  @media (min-width: ${({ theme }) => theme.screen.smMin}) {
    top: 15px;
    right: 85px;
    font-size: 7em;
  }
  @media (min-width: ${({ theme }) => theme.screen.lgMin}) {
    top: 70px;
    right: 125px;
    font-size: 7em;
  }
`;

const DrawPile = styled(Hand)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const DiscardPile = styled(Hand)`
  position: absolute;
  top: 50px;
  left: 100px;
`;

const GameOver = styled.h1`
  font-variant: small-caps;
  text-transform: capitalize;
`;

const Actions = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
`;

const Winners = styled.div`
  ${position('absolute', null, 0, 0, 0)};
  display: flex;
  flex-flow: row wrap;
  padding: 10px;
  justify-content: center;
`;

const Winner = styled.div`
  margin: 0 10px;
`;

const PlayArea = () => {
  const {
    clientId,
    gameState,
    playCards,
    pickUpAttacks,
    setSelectedCards,
    setErrorMsg,
  } = useGameContext();
  const player = gameState.getPlayer(clientId) || gameState.attacker;
  const isPlaying = player.id === clientId;
  const isDefender = gameState.isDefender(clientId);
  const [hoverCard, setHoverCard] = useState(null);
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'card',
    drop: ({ id }) => {
      setErrorMsg(null);
      playCards({
        type: 'attack',
        cards: [{ id }],
      }).then(
        () => setSelectedCards([]),
        (err) => {
          setErrorMsg(err.message.replace('Fetch failed: ', ''));
          setSelectedCards([]);
        },
      );
    },
    hover: ({ id }) => setHoverCard(Card.deserialize(id)),
    canDrop: () => !isDefender,
    collect: (mon) => ({
      isOver: !!mon.isOver(),
      canDrop: !!mon.canDrop(),
    }),
  });

  const { trumpSuit } = gameState;
  const { symbol: trumpSymbol } = new Card('2', trumpSuit || 'X', 'X');

  const pickUp = () => {
    setErrorMsg(null);
    pickUpAttacks().then(
      () => setSelectedCards([]),
      (err) => {
        setErrorMsg(err.message.replace('Fetch failed: ', ''));
        setSelectedCards([]);
      },
    );
  };

  return (
    <Box ref={drop}>
      {trumpSuit && <TrumpIndicator>{trumpSymbol}</TrumpIndicator>}
      {gameState.trumpCard && <TrumpCard card={gameState.trumpCard} inDeck />}
      <DrawPile hand={gameState.deck} deck />
      <DiscardPile hand={gameState.discard} deck disheveled />
      {gameState.gameOver ? (
        <>
          <GameOver>Game Over</GameOver>
          {gameState.durak && (
            <h3>
              <Icon name="beer" /> {gameState.getPlayer(gameState.durak)?.name} is the durak!
            </h3>
          )}
        </>
      ) : null}
      <AttackArea>
        {gameState.attacks.map(({ attack, defense }) => (
          <AttackGroup key={attack.id} attack={attack} defense={defense} />
        ))}
        {canDrop && isOver && hoverCard && <AttackGroup css="opacity: 0.5" attack={hoverCard} />}
      </AttackArea>
      {isPlaying && (
        <Actions>
          {isDefender && gameState.unbeatenAttacks.length > 0 ? (
            <IconButton primary text onClick={pickUp}>
              <Icon name="skull-crossbones" />
              Pick Up
            </IconButton>
          ) : null}
        </Actions>
      )}
      <Winners>
        {gameState.winners.map((p) => (
          <Winner key={p.id}>
            <Icon name="crown" /> {p.name}
          </Winner>
        ))}
      </Winners>
    </Box>
  );
};

export default PlayArea;
