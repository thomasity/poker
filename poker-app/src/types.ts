export type Suit = 'heart' | 'diamond' | 'club' | 'spade';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'Jack' | 'Queen' | 'King' | 'Ace';
export interface Card { suit: Suit; rank: Rank }

export type PlayerAction = { type: 'call' } | { type: 'bet'; amount: number } | { type: 'fold' } | { type: 'all-in' };

export type BotProfile = "basic" | "random" | "tight" | "aggressive";

export interface PlayerBase { 
    id: string;
    name: string;
    chips: number;
    hand: [] | [Card] | [Card, Card];
    folded: boolean;
    currentBet: number;
    totalBet: number;
    madeAction: boolean;
}

export interface HumanPlayer extends PlayerBase {
    kind: "human";
}

export interface BotPlayer extends PlayerBase {
    kind: "bot";
    botProfile: BotProfile;
}

export type Player = HumanPlayer | BotPlayer;

export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export type Phase = 'inHand' | 'handOver';

export interface GameState {
    playing: boolean;
    deck: Card[];
    community: Card[];
    players: Player[];
    street: Street;
    pot: number;
    bigBlind: number;
    smallBlind: number;
    dealerButton: number;
    currentBet: number;
    currentPlayer: number;
    phase: Phase;
    isGameOver: boolean;
}
