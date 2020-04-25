// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { position } from 'polished';
import { useDrop } from 'react-dnd';

import useTableContext from '../hooks/useTableContext';
import Hand from './Hand';
import Icon from './Icon';
import IconButton from './IconButton';
import CardComponent from './Card';
import AttackGroup from './AttackGroup';
import Card from '../api/Card';

const Box = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.table.darkGreen};
  border-radius: 20px;
  background-color: ${({ theme }) => theme.table.pokerGreen};
  position: relative;
`;

const AttackArea = styled.div`
  flex: 1 1;
  display: flex;
  flex-flow: row wrap;
  align-content: center;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  z-index: 2;
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
  z-index: 1;
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
  z-index: 1;
`;

const DrawPile = styled(Hand)`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
`;

const DiscardPile = styled(Hand)`
  position: absolute;
  top: 50px;
  left: 100px;
  z-index: 0;
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

const ClientList = styled.div`
  ${position('absolute', null, 0, 0, 0)};
  display: flex;
  flex-flow: row wrap;
  padding: 10px;
  justify-content: center;
`;

const Client = styled.div`
  margin: 0 10px;
`;

const PlayArea = () => {
  const {
    clientId,
    spectators,
    gameState,
    playCards,
    declareAsBeat,
    pickUpAttacks,
    setSelectedCards,
    setErrorMsg,
  } = useTableContext();
  const player = gameState.getPlayer(clientId) || gameState.primaryAttacker;
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

  const itsBeat = () => {
    setErrorMsg(null);
    declareAsBeat().then(null, (err) => {
      setErrorMsg(err.message.replace('Fetch failed: ', ''));
    });
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
          {!isDefender && gameState.attacks.length > 0 && gameState.unbeatenAttacks.length === 0 ? (
            <IconButton
              primary
              text
              onClick={itsBeat}
              disabled={gameState.beatVotes.includes(player.id)}
            >
              <Icon name="trophy" />
              It&apos;s beat
            </IconButton>
          ) : null}
        </Actions>
      )}
      <ClientList>
        {spectators.map((p) => (
          <Client key={p.id}>
            <Icon
              name={
                gameState.winners.find(({ id }) => id === p.id)
                  ? 'crown'
                  : p.connected
                  ? 'eye'
                  : 'eye-slash'
              }
            />{' '}
            {p.name}
          </Client>
        ))}
      </ClientList>
    </Box>
  );
};

export default PlayArea;
