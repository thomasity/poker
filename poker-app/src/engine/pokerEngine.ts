import type { GameState, GameEffect, Player, PlayerAction, GameEvent, PregameConfig } from '../types';
import { createDeck, shuffleDeck } from './deck';
import * as bots from '../bots';

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

function applyAction(
    state: GameState,
    action: PlayerAction
) : GameState {
    const players = state.players.map(p => ({ ...p }));
    const player = players[state.currentPlayer];

    let pot = state.pot;
    let currentBet = state.currentBet;

    if (action.type === 'fold' && player.action === undefined) {
        console.log(`${player.name} folding...`);
        player.folded = true;
        player.action = { type: 'fold' };
        player.currentBet = 0;
    }
    else if (action.type === 'call' && player.action === undefined) {  
        const toCall = Math.max(0, currentBet - player.currentBet);
        const paid = Math.min(player.chips, toCall);
        player.chips -= paid;
        pot += paid;
        console.log(`${player.name} calling with ${paid}`);
        player.currentBet = paid;
        player.totalBet += paid;
        player.action = { type: 'call' };
    }
    else if (action.type === 'bet' && player.action === undefined ) {
        console.log(`${player.name} betting ${action.amount}...`);
        const amt = Math.max(0, Math.min(player.chips, action.amount));
        player.chips -= amt;
        pot += amt;
        player.currentBet = amt;
        player.totalBet += amt;
        currentBet = amt;
        player.action = { type: 'bet', amount: amt };
    }
    
    players[state.currentPlayer] = player 

    const nextPlayer = (state.currentPlayer + 1) % players.length;
    
    return { ...state, players, pot, currentBet, currentPlayer: nextPlayer };
}

export function startHand(state: GameState) : GameState {
    const deck = shuffleDeck(createDeck());
    const players = state.players.map(p => ({ ...p }));
    console.log("Dealing cards...");

    while (players.every(p => p.hand.length < 2)) {
        players.forEach(player => {
            if (player.hand.length < 2) {
                const card = deck.pop();
                if (card) {
                    if (player.hand.length === 0) {
                        player.hand = [card];
                    } else if (player.hand.length === 1) {
                        player.hand = [player.hand[0], card];
                    }
                }
            }
        });
    }

    players.forEach(p => {
        p.currentBet = 0;
        p.totalBet = 0;
        p.action = undefined;
        p.folded = false;
    });

    return {
        ...state,
        deck,
        community: [],
        pot: 0,
        currentBet: 0,
        currentPlayer: 0,
        players,
        street: 'preflop',
        phase: 'inHand'
    }
}

export function endHand(state: GameState) : GameState {
    const players = state.players.map(p => ({ ...p }));
    const winner_index = players.findIndex(p => !p.folded);
    const winner = players[winner_index];

    winner.chips += state.pot;
    players[winner_index] = winner;
    players.forEach(p => p.hand = []);

    return { 
        ...state,
        pot: 0,
        currentBet: 0,
        phase: 'handOver',
        players
    };
}

export function advanceStreet(state : GameState) : GameState {
    const players = state.players.map(p => ({ ...p }))
    const community = [...state.community];
    const deck = [...state.deck];
    let street = state.street;
    
    if (street === 'preflop' && community.length === 0) {
        console.log("Flopping...")
        for (let i = 0; i < 3; ++i) {
            const card = deck.pop();
            if (card) community.push(card);
        }
        street = 'flop';
        players.forEach(p => {
            p.action = undefined;
            p.currentBet = 0;
        });
        return { ...state, street, community, deck, players, currentBet: 0 };
    }

    else if (street === 'flop' && community.length === 3) {
        const card = deck.pop();
        if (card) community.push(card);
        street = 'turn';
        players.forEach(p => {
            p.action = undefined;
            p.currentBet = 0;
        });
        return { ...state, street, community, deck, players, currentBet: 0 };
    }

    else if (street === 'turn' && community.length === 4) {
        const card = deck.pop();
        if (card) community.push(card);
        street = 'river';
        players.forEach(p => {
            p.action = undefined;
            p.currentBet = 0;
        });
        return { ...state, street, community, deck, players, currentBet: 0 };
    }

    return { ...state };
}



function readyToAdvanceStreet(state : GameState) : number {
    const active = state.players.filter(p => !p.folded);
    if (active.length === 1) return 1;
    const allPlayersActed = active.every(p => p.action !== undefined);
    const allPlayersMatched = active.every(p => p.currentBet === state.currentBet);
    if (allPlayersActed && allPlayersMatched) return 2;
    return 0;

}

export function reduceGame(state: GameState, event: GameEvent) : { state: GameState; effects: GameEffect[] } {
    switch(event.type) {
        case "INITIATE_GAME": {
            console.log("Initiating game...");
            const next = startGame(state, event.config);
            return {
                state: next,
                effects: [{ type: "AFTER", ms: 1000, event: { type: "START_NEXT_HAND" }, key: "hand" } ]
            }
        }
        case "START_NEXT_HAND": {
            console.log("Starting hand...");
            const next = startHand(state);
            return {
                state: next,
                effects: []
            }
        }
        
        case "PLAYER_ACTION": {
            if (state.phase !== "inHand") {
                return { state, effects: [] };
            }

            const next = applyAction(state, event.action);

            const nextPlayerIsBot = next.phase === "inHand" && next.players[next.currentPlayer]?.kind === "bot";

            switch(readyToAdvanceStreet(next)) {
                case 1:
                    // Everyone else has folded. Winner takes all. No need for showdown.
                    return { state: next, effects: [{ type: "AFTER", ms: 1000, event: { type:"END_HAND" }, key: "hand" }]};
                case 2:
                    // Multiple players still active and everyone has matched current bet. Advance Street.
                    return { state: next, effects: [{ type: "AFTER", ms: 1000, event: { type: "ADVANCE_STREET" }, key: "street" }]};
                }

            return { state: next, effects: nextPlayerIsBot ? [{ type: "BOT_TURN_AFTER", ms: 1000, key: "bot" }] : [] };
        }


        case "BOT_ACTION": {
            if (state.phase !== "inHand") return { state, effects: [] };

            const next = applyAction(state, event.action);
            const nextPlayerIsBot = next.phase === "inHand" && next.players[next.currentPlayer]?.kind === "bot";
            
            switch(readyToAdvanceStreet(next)) {
                case 1:
                    // Everyone else has folded. Winner takes all. No need for showdown.
                    return { state: next, effects: [{ type: "AFTER", ms: 1000, event: { type:"END_HAND" }, key: "hand" }]};
                case 2:
                    // Multiple players still active and everyone has matched current bet. Advance Street.
                    return { state: next, effects: [{ type: "AFTER", ms: 1000, event: { type: "ADVANCE_STREET" }, key: "street" }]};
                }

            return { state: next, effects: nextPlayerIsBot ? [{ type: "BOT_TURN_AFTER", ms: 1000, key: "bot" }] : [] };
        }

        case "ADVANCE_STREET": {
            if (state.phase !== "inHand") return { state, effects: [] };
            
            if (state.street === 'river') {
                return { state: state, effects: [{ type: "AFTER", ms: 1000, event: { type: "START_SHOWDOWN" }, key: "hand" }]};
            }
            else {
                const next = advanceStreet(state);
                const nextPlayerIsBot = next.phase === "inHand" && next.players[next.currentPlayer]?.kind === "bot";

                return { state: next, effects: nextPlayerIsBot ? [{ type: "BOT_TURN_AFTER", ms: 1000, key: "bot" }] : [] };
            }
        }

        case "START_SHOWDOWN": {
            const next = { ...state, phase: 'showdown' as const }
            return {
                state: next,
                effects: [{ type: "AFTER", ms: 1000, event: { type: "END_HAND" }, key: "hand" } ]
            }
        }

        case "END_HAND": {
            const next = endHand(state);
            return {
                state: next,
                effects: [{ type: "AFTER", ms: 1000, event: { type: "START_NEXT_HAND" }, key: "hand" } ]
            }
        }

        default:
            return { state, effects: []};
    }
}