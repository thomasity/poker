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
        }
    ]

    const dealerButton = players.findIndex(p => p.kind === "human");
    const smallBlind = players.length > 2 ? (dealerButton + 1) % players.length : dealerButton;
    const bigBlind = (smallBlind + 1) % players.length;

    return {
        playing: false,
        deck: [],
        community: [],
        players,
        street: 'preflop',
        pot: 0,
        bigBlind,
        smallBlind,
        dealerButton,
        currentBet: 0,
        currentPlayer: smallBlind,
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
    players = [...players, ...config.players];
    players.forEach(p => p.chips = config.buyIn);
    return {
        ...state,
        playing: true,
        players: players,
    }
}