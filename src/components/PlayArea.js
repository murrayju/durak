// @flow
import React from 'react';
import styled from 'styled-components';
import { position } from 'polished';
import { useDrop } from 'react-dnd';

import useGameContext from '../hooks/useGameContext';
import Hand from './Hand';
import Icon from './Icon';
import IconButton from './IconButton';
import CardComponent from './Card';
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
`;

const AttackGroup = styled.div``;

const AttackCard = styled(CardComponent)`
  position: static;
  margin: 0;
`;
const DefenseCard = styled(CardComponent)`
  position: static;
  margin-top: 65px;
`;

const TrumpCard = styled(CardComponent)`
  transform: rotate(90deg);
  position: absolute;
  top: 30px;
  right: 80px;
`;

const DrawPile = styled(Hand)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const DiscardPile = styled(Hand)`
  position: absolute;
  top: 10px;
  left: 10px;
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
    selectedCards,
    setSelectedCards,
    setErrorMsg,
  } = useGameContext();
  const [{ isOver }, drop] = useDrop({
    accept: 'card',
    drop: (dropped) => console.log('dropped', dropped),
    hover: (item) => console.log('hovering', item),
    canDrop: () => true,
    collect: (mon) => ({
      isOver: !!mon.isOver(),
      canDrop: !!mon.canDrop(),
    }),
  });

  const player = gameState.getPlayer(clientId) || gameState.attacker;
  const isPlaying = player.id === clientId;
  const isDefender = gameState.isDefender(clientId);

  const defend = (targetCard: Card) => {
    setErrorMsg(null);
    playCards({
      type: 'defend',
      cards: selectedCards.map(({ id }) => ({
        id,
        target: targetCard.id,
      })),
    }).then(
      () => setSelectedCards([]),
      (err) => {
        setErrorMsg(err.message.replace('Fetch failed: ', ''));
        setSelectedCards([]);
      },
    );
  };

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
    <Box>
      {gameState.trumpCard && <TrumpCard card={gameState.trumpCard} inDeck />}
      <DrawPile hand={gameState.deck} deck />
      <DiscardPile hand={gameState.discard} deck />
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
      <AttackArea ref={drop}>
        {gameState.attacks.map(({ attack, defense }) => (
          <AttackGroup>
            <AttackCard card={attack} onCardClick={isDefender ? defend : null} />
            {defense && <DefenseCard card={defense} />}
          </AttackGroup>
        ))}
        {isOver && 'hovering'}
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
          <Winner>
            <Icon name="crown" /> {p.name}
          </Winner>
        ))}
      </Winners>
    </Box>
  );
};

export default PlayArea;
