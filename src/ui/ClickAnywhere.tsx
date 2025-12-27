import type { GameState } from '../types';

export default function ClickAnywhere({ state, onClick } : { state: GameState, onClick: () => void; }) {
    const HandOutcome = ({ className } : { className: string}) => {
        if (state.winnerInfo !== undefined) {
            if (state.players[state.winnerInfo.winnerIndex].handValue !== undefined) {
                return (
                    <div className={className}>
                        <p>Winner: {state.players[state.winnerInfo.winnerIndex].name}</p>
                        <p>Winning Hand: {state.winnerInfo.winningHand}</p>
                        <p>Winnings: ${state.winnerInfo.amount}</p>
                    </div>
                )
            }
            else {
                return (
                    <div className={className}>
                        <p>Winner: {state.players[state.winnerInfo.winnerIndex].name}</p>
                        <p>Winnings: ${state.winnerInfo.amount}</p>
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