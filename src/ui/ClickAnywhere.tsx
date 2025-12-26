import type { GameState } from '../types';

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


export default function ClickAnywhere({ state, onClick } : { state: GameState, onClick: () => void; }) {
    const HandOutcome = ({ className } : { className: string}) => {
        if (state.handWinner !== undefined) {
            if (state.players[state.handWinner].handValue !== undefined) {
                return (
                    <div className={className}>
                        <p>Winner: {state.players[state.handWinner].name}</p>
                        <p>Winning Hand: {HAND_CATEGORIES[state.players[state.handWinner].handValue!.category] ?? "Unknown"}</p>
                        <p>Winnings: {state.pot}</p>
                    </div>
                )
            }
            else {
                return (
                    <div className={className}>
                        <p>Winner: {state.players[state.handWinner].name}</p>
                        <p>Winnings: {state.pot}</p>
                    </div>
                )
            }
        }
        return null;
    }

    return (
        <div className="click-anywhere" onClick={onClick}>
            <HandOutcome className="hand-outcome" />
        </div>
    )
}