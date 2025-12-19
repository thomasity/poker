import type { GameState, Player, PlayerAction } from '../types';
import { createDeck, shuffleDeck } from './deck';

export function initGame() : GameState {

    const players: Player[] = [
        {
            id: '1',
            kind: "human",
            name: 'You',
            chips: 100,
            hand: [],
            folded: false,
            currentBet: 0,
            totalBet: 0,
            madeAction: false
        },
        {
            id: '2',
            kind: "bot",
            botProfile: "basic",
            name: 'Bot 1',
            chips: 100,
            hand: [],
            folded: false,
            currentBet: 0,
            totalBet: 0,
            madeAction: false,
        }
    ]

    const dealerButton = players.findIndex(p => p.kind === "human");
    const smallBlind = players.length > 2 ? (dealerButton + 1) % players.length : dealerButton;
    const bigBlind = (smallBlind + 1) % players.length;

    return {
        playing: true,
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

function handlePlayerAction(
    state: GameState,
    player: Player,
    players: Player[],
    action: PlayerAction
) : GameState {

    let pot = state.pot;
    let currentBet = state.currentBet;

    if (action.type === 'fold' && !player.madeAction) {
        console.log(`${player.name} folding...`);
        player.folded = true;
        player.madeAction = true;
        player.currentBet = 0;
    }
    else if (action.type === 'call' && !player.madeAction) {  
        const toCall = Math.max(0, currentBet - player.currentBet);
        const paid = Math.min(player.chips, toCall);
        player.chips -= paid;
        pot += paid;
        console.log(`${player.name} calling with ${paid}`);
        player.currentBet = paid;
        player.totalBet += paid;
        player.madeAction = true;
    }
    else if (action.type === 'bet' && !player.madeAction) {
        console.log(`${player.name} betting ${action.amount}...`);
        const amt = Math.max(0, Math.min(player.chips, action.amount));
        player.chips -= amt;
        pot += amt;
        player.currentBet = amt;
        player.totalBet += amt;
        currentBet = amt;
        player.madeAction = true;
    }

    players[state.currentPlayer] = player 
    
    return { ...state, players, pot, currentBet };
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
        p.madeAction = false;
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

function endHand(state: GameState) : GameState {
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

function advanceStreet(state : GameState) {
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
            p.madeAction = false;
            p.currentBet = 0;
        });
        return { ...state, street, community, deck, players, currentBet: 0 };
    }

    else if (street === 'flop' && community.length === 3) {
        const card = deck.pop();
        if (card) community.push(card);
        street = 'turn';
        players.forEach(p => {
            p.madeAction = false;
            p.currentBet = 0;
        });
        return { ...state, street, community, deck, players, currentBet: 0 };
    }

    else if (street === 'turn' && community.length === 4) {
        const card = deck.pop();
        if (card) community.push(card);
        street = 'river';
        players.forEach(p => {
            p.madeAction = false;
            p.currentBet = 0;
        });
        return { ...state, street, community, deck, players, currentBet: 0 };
    }

    else if (street === 'river' && community.length === 5) {
        return endHand(state);
    }

    return { ...state };
}

export function applyAction(state: GameState, action: PlayerAction) {
    const players = state.players.map(p => ({ ...p }))
    const player = players[state.currentPlayer];


    let nextState : GameState = handlePlayerAction(state, player, players, action);
    console.log(nextState.players[state.currentPlayer]);
    const active = players.filter(p => !p.folded);
    const everyoneActed = active.every(p => p.madeAction);
    const everyoneMatched = active.every(p => p.currentBet === state.currentBet);

    if (active.length === 1) {
        console.log("Hand complete.");
        nextState = endHand(nextState);
    }
    else if (everyoneActed && everyoneMatched) {
        console.log("Advancing street...");
        nextState = advanceStreet(nextState);
    
        nextState = {
            ...nextState,
            currentPlayer: 0,
        }
    }
    else {
        console.log("Rotating to next player...");
        const nextPlayer = (state.currentPlayer + 1) % players.length;
        nextState = {
            ...nextState,
            currentPlayer: nextPlayer,
        }
    }

    return nextState;
}