export type Suit = 'heart' | 'diamond' | 'club' | 'spade';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'Jack' | 'Queen' | 'King' | 'Ace';
export interface Card { suit: Suit; rank: Rank }

export type HandCategory =
  | 8 // Straight Flush
  | 7 // Four of a Kind
  | 6 // Full House
  | 5 // Flush
  | 4 // Straight
  | 3 // Three of a Kind
  | 2 // Two Pair
  | 1 // One Pair
  | 0; // High Card

export interface HandValue {
  category: HandCategory;
  tiebreakers: number[]; // highest first
}

export interface HandOutcome {
    winner_index: number;
    amount: number;
    winningHand: HandCategory;
}

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
    action?: PlayerAction;
    handValue?: HandValue;
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

export type Phase = 'inHand' | 'handOver' | 'showdown' | 'dealing' ;

export type PregameConfig = {
    players: Player[],
    buyIn: number,
    bigBlind: number,
    smallBlind: number
}

export type GameEvent = 
    | { type: "PLAYER_ACTION"; action: PlayerAction }
    | { type: "BOT_ACTION"; action: PlayerAction }
    | { type: "ADVANCE_STREET" }
    | { type: "START_SHOWDOWN" }
    | { type: "END_HAND" }
    | { type: "START_NEXT_HAND" }
    | { type: "INITIATE_GAME"; config: PregameConfig }
    | { type: "END_GAME" }

export type GameEffect =
    | { type: "NONE" }
    | { type: "AFTER"; ms: number; event: GameEvent; key: "street" | "hand" | "bot" }
    | { type: "BOT_TURN_AFTER"; ms: number, key: "bot" };

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
    handWinner?: number
    phase: Phase;
    isGameOver: boolean;
}
