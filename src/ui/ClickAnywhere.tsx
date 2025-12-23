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

    return (
        <div style={{ position: 'absolute', height: '100vh', width: '100vw', background: 'black', opacity: 0.5, color: 'white', zIndex: 3000, cursor: 'pointer' }} onClick={onClick}>
            <h2 style={{ margin: 'auto', zIndex: 4000 }}>Click anywhere for next hand.</h2>
            {state.handWinner !== undefined &&
                <>
                    <p>Winner: {state.players[state.handWinner].name}</p>
                    <p>Winning Hand: {HAND_CATEGORIES[state.players[state.handWinner].handValue!.category] ?? "Unknown"}</p>
                    <p>Winnings: {state.pot}</p>
                </>
            }
        </div>
    )
}