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
import ProgressTimer from './ProgressTimer';
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
  flex: 0 0;
  display: flex;
  flex-flow: row wrap;
  align-content: center;
  align-items: center;
  justify-content: space-evenly;
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

const GameOverBox = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  z-index: 3;
`;

const GameOver = styled.h1`
  font-variant: small-caps;
  text-transform: capitalize;
`;

const Bottom = styled.div`
  ${position('absolute', null, 0, 0, 0)};
  display: flex;
  flex-flow: column nowrap;
`;

const Actions = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
`;

const ClientList = styled.div`
  display: flex;
  flex-flow: row wrap;
  padding: 10px;
  justify-content: center;
`;

const Client = styled.div`
  margin: 0 10px;
`;

const PickUpTimer = styled(ProgressTimer)`
  && {
    width: 40%;
    height: 20px;
  }
`;

const PlayArea = () => {
  const {
    clientId,
    spectators,
    gameState,
    config,
    playCards,
    declareDoneAttacking,
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

  const doneAttacking = () => {
    setErrorMsg(null);
    declareDoneAttacking().then(null, (err) => {
      setErrorMsg(err.message.replace('Fetch failed: ', ''));
    });
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
        <GameOverBox>
          <GameOver>Game Over</GameOver>
          {gameState.durak && (
            <h3>
              <Icon name="beer" /> {gameState.getPlayer(gameState.durak)?.name} is the durak!
            </h3>
          )}
        </GameOverBox>
      ) : null}
      <AttackArea>
        {gameState.attacks.map(({ attack, defense }) => (
          <AttackGroup key={attack.id} attack={attack} defense={defense} />
        ))}
        {canDrop && isOver && hoverCard && <AttackGroup css="opacity: 0.5" attack={hoverCard} />}
      </AttackArea>
      {gameState.phase === 'pickUp' && (
        <>
          <h3>{gameState.defender.name} is picking up!</h3>
          <small>Any more attacks?</small>
          <PickUpTimer striped active bsStyle="warning" timeSpan={config.pickUpTimer} />
        </>
      )}
      <Bottom>
        {isPlaying && (
          <Actions>
            {isDefender && gameState.unbeatenAttacks.length > 0 ? (
              <IconButton warning text onClick={pickUp}>
                <Icon name="skull-crossbones" />
                Pick Up
              </IconButton>
            ) : null}
            {!isDefender && gameState.looksBeat ? (
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
            {!isDefender && gameState.phase === 'pickUp' ? (
              <IconButton
                primary
                text
                onClick={doneAttacking}
                disabled={gameState.pickUpVotes.includes(player.id)}
              >
                <Icon name="flag" />
                Done Attacking
              </IconButton>
            ) : null}
          </Actions>
        )}
        <ClientList>
          {spectators.map((s) => (
            <Client key={s.id}>
              <Icon name={s.connected ? 'eye' : 'eye-slash'} /> {s.name}
            </Client>
          ))}
        </ClientList>
      </Bottom>
    </Box>
  );
};

export default PlayArea;
