import type { GameState, Player, PregameConfig } from '../types';

export function initGame() : GameState {

    const players: Player[] = [
        {
            id: '1',
            kind: "human",
            name: 'You',
            chips: 1000,
            hand: [],
            folded: false,
            currentBet: 0,
            totalBet: 0,
            index: 0
        }
    ]

    const dealerButton = -1;

    return {
        playing: false,
        deck: [],
        community: [],
        players,
        street: 'preflop',
        pot: 0,
        bigBlind: 10,
        smallBlind: 5,
        dealerButton,
        currentBet: 0,
        currentPlayer: (dealerButton + 1) % players.length,
        phase: 'handOver',
        isGameOver: false
    }
}

/** 
 * Begins poker game with configuration.
 *
 * @param state - A default game state.
 * @param config - The configuration of the game, including: opponents, small blind value, and big blind value.
 * @returns The gamestate, ready to begin first hand.
 */
export function startGame(state: GameState, config: PregameConfig) : GameState {
    let players = state.players.map(p => ({ ...p })) as Player[];
    config.players.forEach(p => players.push(p));
    players.forEach((p, i) => {
        p.chips = config.buyIn
        p.index = i;
    });
    return {
        ...state,
        playing: true,
        players: players,
        phase: 'dealing',
    }
}