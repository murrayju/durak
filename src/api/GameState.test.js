// @flow
import GameState from './GameState';

describe('Incrementing turns', () => {
  test('when attacker goes out', () => {
    const state = new GameState({
      deck: [],
      trumpCard: null,
      players: [
        { id: '1', name: 'Alice', hand: ['A:D'] },
        { id: '2', name: 'Bob', hand: [] },
        { id: '3', name: 'Cathy', hand: ['A:C'] },
        { id: '4', name: 'Dan', hand: ['A:H'] },
      ],
      attacks: [['2:C', '3:C']],
      turn: 1,
    });
    expect(state.turn).toBe(1);
    expect(state.primaryAttacker.name).toEqual('Bob');
    expect(state.defender.name).toEqual('Cathy');

    state.incrementTurn();

    expect(state.turn).toBe(1);
    expect(!!state.players.find((p) => p.name === 'Bob')).toBeFalse;
    expect(state.primaryAttacker.name).toEqual('Cathy');
    expect(state.defender.name).toEqual('Dan');
  });

  test('when attacker and defender both go out', () => {
    const state = new GameState({
      deck: [],
      trumpCard: null,
      players: [
        { id: '1', name: 'Alice', hand: ['A:D'] },
        { id: '2', name: 'Bob', hand: [] },
        { id: '3', name: 'Cathy', hand: [] },
        { id: '4', name: 'Dan', hand: ['A:H'] },
      ],
      attacks: [['2:C', '3:C']],
      turn: 1,
    });
    expect(state.turn).toBe(1);
    expect(state.primaryAttacker.name).toEqual('Bob');
    expect(state.defender.name).toEqual('Cathy');

    state.incrementTurn();

    expect(state.turn).toBe(1);
    expect(!!state.players.find((p) => p.name === 'Bob')).toBeFalse;
    expect(!!state.players.find((p) => p.name === 'Cathy')).toBeFalse;
    expect(state.primaryAttacker.name).toEqual('Dan');
    expect(state.defender.name).toEqual('Alice');
  });

  test('when two attackers go out (consecutive)', () => {
    const state = new GameState({
      deck: [],
      trumpCard: null,
      players: [
        { id: '1', name: 'Alice', hand: [] },
        { id: '2', name: 'Bob', hand: [] },
        { id: '3', name: 'Cathy', hand: ['A:D'] },
        { id: '4', name: 'Dan', hand: ['A:H'] },
      ],
      attacks: [['2:C', '3:C']],
      turn: 1,
    });
    expect(state.turn).toBe(1);
    expect(state.primaryAttacker.name).toEqual('Bob');
    expect(state.defender.name).toEqual('Cathy');

    state.incrementTurn();

    expect(state.turn).toBe(0);
    expect(!!state.players.find((p) => p.name === 'Alice')).toBeFalse;
    expect(!!state.players.find((p) => p.name === 'Bob')).toBeFalse;
    expect(state.primaryAttacker.name).toEqual('Cathy');
    expect(state.defender.name).toEqual('Dan');
  });

  test('when two attackers go out (spaced)', () => {
    const state = new GameState({
      deck: [],
      trumpCard: null,
      players: [
        { id: '1', name: 'Alice', hand: ['A:H'] },
        { id: '2', name: 'Bob', hand: [] },
        { id: '3', name: 'Cathy', hand: ['A:D'] },
        { id: '4', name: 'Dan', hand: [] },
      ],
      attacks: [['2:C', '3:C']],
      turn: 1,
    });
    expect(state.turn).toBe(1);
    expect(state.primaryAttacker.name).toEqual('Bob');
    expect(state.defender.name).toEqual('Cathy');

    state.incrementTurn();

    expect(state.turn).toBe(1);
    expect(!!state.players.find((p) => p.name === 'Bob')).toBeFalse;
    expect(!!state.players.find((p) => p.name === 'Dan')).toBeFalse;
    expect(state.primaryAttacker.name).toEqual('Cathy');
    expect(state.defender.name).toEqual('Alice');
  });

  test('when two attackers go out (wrap)', () => {
    const state = new GameState({
      deck: [],
      trumpCard: null,
      players: [
        { id: '1', name: 'Alice', hand: ['A:H'] },
        { id: '2', name: 'Bob', hand: [] },
        { id: '3', name: 'Cathy', hand: ['A:D'] },
        { id: '4', name: 'Dan', hand: [] },
      ],
      attacks: [['2:C', '3:C']],
      turn: 3,
    });
    expect(state.turn).toBe(3);
    expect(state.primaryAttacker.name).toEqual('Dan');
    expect(state.defender.name).toEqual('Alice');

    state.incrementTurn();

    expect(state.turn).toBe(0);
    expect(!!state.players.find((p) => p.name === 'Bob')).toBeFalse;
    expect(!!state.players.find((p) => p.name === 'Dan')).toBeFalse;
    expect(state.primaryAttacker.name).toEqual('Alice');
    expect(state.defender.name).toEqual('Cathy');
  });

  test('when two attackers go out (wrap, non-primary)', () => {
    const state = new GameState({
      deck: [],
      trumpCard: null,
      players: [
        { id: '1', name: 'Alice', hand: ['A:H'] },
        { id: '2', name: 'Bob', hand: [] },
        { id: '3', name: 'Cathy', hand: [] },
        { id: '4', name: 'Dan', hand: ['A:D'] },
      ],
      attacks: [['2:C', '3:C']],
      turn: 3,
    });
    expect(state.turn).toBe(3);
    expect(state.primaryAttacker.name).toEqual('Dan');
    expect(state.defender.name).toEqual('Alice');

    state.incrementTurn();

    expect(state.turn).toBe(0);
    expect(!!state.players.find((p) => p.name === 'Bob')).toBeFalse;
    expect(!!state.players.find((p) => p.name === 'Cathy')).toBeFalse;
    expect(state.primaryAttacker.name).toEqual('Alice');
    expect(state.defender.name).toEqual('Dan');
  });

  test('when two attackers go out (after primary)', () => {
    const state = new GameState({
      deck: [],
      trumpCard: null,
      players: [
        { id: '1', name: 'Alice', hand: ['A:H'] },
        { id: '2', name: 'Bob', hand: ['A:D'] },
        { id: '3', name: 'Cathy', hand: [] },
        { id: '4', name: 'Dan', hand: [] },
      ],
      attacks: [['2:C', '3:C']],
      turn: 0,
    });
    expect(state.turn).toBe(0);
    expect(state.primaryAttacker.name).toEqual('Alice');
    expect(state.defender.name).toEqual('Bob');

    state.incrementTurn();

    expect(state.turn).toBe(1);
    expect(!!state.players.find((p) => p.name === 'Cathy')).toBeFalse;
    expect(!!state.players.find((p) => p.name === 'Dan')).toBeFalse;
    expect(state.primaryAttacker.name).toEqual('Bob');
    expect(state.defender.name).toEqual('Alice');
  });

  test('when two attackers go out (around defender)', () => {
    const state = new GameState({
      deck: [],
      trumpCard: null,
      players: [
        { id: '1', name: 'Alice', hand: [] },
        { id: '2', name: 'Bob', hand: ['A:D'] },
        { id: '3', name: 'Cathy', hand: [] },
        { id: '4', name: 'Dan', hand: ['A:H'] },
      ],
      attacks: [['2:C', '3:C']],
      turn: 0,
    });
    expect(state.turn).toBe(0);
    expect(state.primaryAttacker.name).toEqual('Alice');
    expect(state.defender.name).toEqual('Bob');

    state.incrementTurn();

    expect(state.turn).toBe(0);
    expect(!!state.players.find((p) => p.name === 'Alice')).toBeFalse;
    expect(!!state.players.find((p) => p.name === 'Cathy')).toBeFalse;
    expect(state.primaryAttacker.name).toEqual('Bob');
    expect(state.defender.name).toEqual('Dan');
  });

  test('when deck is empty', () => {
    const state = new GameState({
      deck: [],
      trumpCard: null,
      players: [
        { id: '1', name: 'Alice', hand: ['A:D'] },
        { id: '2', name: 'Bob', hand: ['A:S'] },
        { id: '3', name: 'Cathy', hand: ['A:C'] },
        { id: '4', name: 'Dan', hand: ['A:H'] },
      ],
      attacks: [['2:C', '3:C']],
      turn: 1,
    });
    expect(state.turn).toBe(1);
    expect(state.primaryAttacker.name).toEqual('Bob');
    expect(state.defender.name).toEqual('Cathy');

    state.incrementTurn();

    expect(state.turn).toBe(2);
    expect(state.primaryAttacker.name).toEqual('Cathy');
    expect(state.defender.name).toEqual('Dan');
  });

  test('skips player when picking up', () => {
    const state = new GameState({
      deck: [],
      trumpCard: null,
      players: [
        { id: '1', name: 'Alice', hand: ['A:D'] },
        { id: '2', name: 'Bob', hand: ['A:S'] },
        { id: '3', name: 'Cathy', hand: ['A:C'] },
        { id: '4', name: 'Dan', hand: ['A:H'] },
      ],
      attacks: [['2:C']],
      turn: 1,
    });
    expect(state.turn).toBe(1);
    expect(state.primaryAttacker.name).toEqual('Bob');
    expect(state.defender.name).toEqual('Cathy');

    state.incrementTurn(true);

    expect(state.turn).toBe(3);
    expect(state.primaryAttacker.name).toEqual('Dan');
    expect(state.defender.name).toEqual('Alice');
  });
});

describe('Remaining attacks', () => {
  test('ignores defender hand size when picking up', () => {
    const state = new GameState({
      deck: [],
      trumpCard: '4:D',
      players: [
        { id: '1', name: 'Alice', hand: ['A:D', 'K:D', 'Q:D', 'J:D'] },
        { id: '2', name: 'Bob', hand: ['A:S', '2:S', '3:S'] },
      ],
      attacks: [['2:C'], ['5:D']],
      turn: 0,
      phase: 'attack',
    });
    expect(state.defender.name).toEqual('Bob');
    // 3 cards in hand, 2 open attacks, room for 1 more
    expect(state.remainingAttackSlots).toBe(1);

    state.phase = 'pickUp';
    // defender is picking up, room for 6 total attacks (4 more)
    expect(state.remainingAttackSlots).toBe(4);
  });
});
