import type { GameState } from '../../types'
import Card from '../cards/Card';
import Player from '../player/Player';
import styles from './PokerTable.module.css';


export function PokerTableDefault({ state } : { state: GameState; }) {
    const show = state.phase === 'showdown' || state.phase === 'ending' || state.phase === 'handOver';

    const opponents = state.players.filter(p => p.kind === 'bot')

    return (
        <div id={styles.table}>
            {opponents.map((p, i) => {
                return(
                    <Player key={`bot-${i}`} player={p} show={show} state={state} />
                )
            })}
            <div className={styles['table-content']}>
                <h2>Pot: ${state.pot}</h2>
                <div className={styles.community}>
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