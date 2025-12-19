import type { Card, Rank, Suit } from '../types';


const SUITS: Suit[] = ['heart', 'diamond', 'club', 'spade'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];

export function createDeck(): Card[] {
    return SUITS.flatMap(suit => RANKS.map(rank => ({ suit, rank })));
}

export function shuffleDeck(deck: Card[]): Card[] {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

