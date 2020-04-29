// @flow
import GameState from './GameState';

describe('Incrementing turns', () => {
  it('correctly increments turn when attacker goes out', () => {
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

  it('correctly increments turn when deck is empty', () => {
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

  it('skips player when picking up', () => {
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
  it('ignores defender hand size when picking up', () => {
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
