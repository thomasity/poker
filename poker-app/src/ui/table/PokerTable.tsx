import type { GameState } from '../../types'
import Card from '../cards/Card';
import Player from '../player/Player';
import styles from './PokerTable.module.css';


export default function PokerTable({ state } : { state: GameState }) {
    const opponents = state.players.filter(p => p.kind === 'bot')
    if (!state) {
        return <div id={styles.table}></div>;
    }
    return (
        <div id={styles.table}>
            {opponents.map((p, i) => {
                const position = `top${i + 1}`
                return(
                    <Player position={position} player={p} />
                )
            })}
            <div id={styles.community}>
                <h2>Pot: {state.pot}</h2>
                <p>Bet to match: {state.currentBet}</p>
                <div id={styles.community}>
                    {state.community.map((c, i) => {
                        return(
                            <Card key={`card ${i}`} card={c} />
                        )
                    })
                    }
                </div>
            </div>
        </div>
    )
}