import type { Suit, Card, HandValue, Rank, GameState, Player } from "../types";

const RANK_VALUE: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'Jack': 11,
  'Queen': 12,
  'King': 13,
  'Ace': 14,
};

function countRanks(cards: Card[]) {
    const map = new Map<number, number>();
    for (const c of cards) {
        const r = RANK_VALUE[c.rank];
        map.set(r, (map.get(r) ?? 0) + 1);
    }
    return map
}

function groupBySuit(cards: Card[]) {
    const map = new Map<Suit, number[]>;
    for (const c of cards) {
        const r = RANK_VALUE[c.rank];
        if (!map.has(c.suit)) map.set(c.suit, []);
        map.get(c.suit)!.push(r);
    }
    return map
}

function findStraight(ranks: number[]): number | null {
    const unique = Array.from(new Set(ranks)).sort((a, b) => b - a);

    if (unique.includes(14)) unique.push(1);

    let run = 1;

    for (let i = 0; i < unique.length; ++i) {
        if ((unique[i] - 1) == unique[i + 1]) {
            run++;
            if (run == 5) return unique[i - 3];
        }
        else {
            run = 1;
        }
    }
    return null;
}

export function evaluateHand(hand: [Card, Card], community: Card[]) : HandValue {

    const cards = [...hand, ...community];
    const ranks = cards.map(c => RANK_VALUE[c.rank]);
    const rankCounts = countRanks(cards);
    const suitGroups = groupBySuit(cards);

    const counts = Array.from(rankCounts.entries())
        .map(([rank, count]) => ({ rank, count }))
        .sort((a, b) => 
            b.count - a.count || b.rank - a.rank
    );

    // Straight Flush
    for (const [, suitRanks] of suitGroups) {
        if (suitRanks.length >= 5) {
            const high = findStraight(suitRanks);
            if (high !== null) return { category: 8, tiebreakers: [high] };
        }
    }

    // Four of a Kind
    if (counts[0].count === 4) {
        const quadRank = counts[0].rank;
        const kicker = Math.max(
            ...counts.filter(c => c.rank !== quadRank).map(c => c.rank)
        );
        return { category: 7, tiebreakers: [quadRank, kicker] };
    }

    // Full House
    if (counts[0].count === 3 && counts[1]?.count >= 2) {
        const trips = counts.filter(c => c.count === 3).map(c => c.rank);
        const pairs = counts.filter(c => c.count === 2).map(c => c.rank);

        if (trips.length >= 1 && (pairs.length >=1 || trips.length >= 2)) {
            const tripRank = trips[0];
            const pairRank = pairs[0] ?? trips[1];
            return { category: 6, tiebreakers: [tripRank, pairRank] };
        }
    }

    // Flush
    for (const [, suitRanks] of suitGroups) {
        if (suitRanks.length >= 5) {
            const top = suitRanks.sort((a, b) => b - a).slice(0,5);
            return { category: 5, tiebreakers: top };
        }
    }

    // Straight
    const straightHigh = findStraight(ranks);
    if (straightHigh !== null) {
        return { category: 4, tiebreakers: [straightHigh] };
    }

    // Set
    if (counts[0].count === 3) {
        const setRank = counts[0].rank;
        const kickers = counts.filter(c => c.rank !== setRank).map(c => c.rank).slice(0, 2);
        return { category: 3, tiebreakers: [setRank, ...kickers] };
    }

    // Two Pair
    if (counts[0].count === 2 && counts[1]?.count === 2) {
        const pairOneRank = counts[0].rank;
        const pairTwoRank = counts[1].rank;
        const kicker = counts.filter(c => c.rank !== pairOneRank && c.rank !== pairTwoRank).map(c => c.rank)[0];
        return { category: 2, tiebreakers: [pairOneRank, pairTwoRank, kicker]}
    }

    // Pair
    if (counts[0].count === 2) {
        const pairRank = counts[0].rank;
        const kickers = counts.filter(c => c.rank !== pairRank).map(c => c.rank).slice(0, 3);
        return { category: 1, tiebreakers: [pairRank, ...kickers] };
    }

    // High Card
    const high = ranks.sort((a, b) => b - a).slice(0, 5);
    return { category: 0, tiebreakers: high };

}

export function compareHands(a: HandValue, b: HandValue): number {
    if (a.category !== b.category) return a.category - b.category;

    for (let i = 0; i < a.tiebreakers.length; ++i) {
        if (a.tiebreakers[i] !== b.tiebreakers[i]) {
            return a.tiebreakers[i] - b.tiebreakers[i];
        }
    }

    return 0;
}

export function maxHandValue(hands: HandValue[]): HandValue {
    if (hands.length === 0) {
        throw new Error("Cannot determinne max of empty hand list.");
    }

    return hands.reduce((best, current) => 
        compareHands(current, best) > 0 ? current : best
    );
}

export function evaluateHands(state: GameState) : Player[] {
    const players = state.players.map(p => ({ ...p }));
    players.forEach(p => {
        if (p.hand.length !== 2) throw new Error(`Player ${p.name}'s hand not suitable for showdown.`)
        if (!p.folded) p.handValue = evaluateHand(p.hand, state.community)  
    });
    return players;
}

export function handToString(handValue: HandValue) : string {

    const HAND_CATEGORIES: Record<number, string> = {
        8: "Straight Flush",
        7: "Four of a Kind",
        6: "Full House",
        5: "Flush",
        4: "Straight",
        3: "Three of a Kind",
        2: "Two Pair",
        1: "One Pair",
        0: "High Card"
    }
    let result = HAND_CATEGORIES[handValue.category] ?? "Unknown Hand";
    return result;
}