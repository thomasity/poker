import { useEffect, useState } from 'react';
import type { GameState } from '../../types'
import Card from '../cards/Card';
import Player from '../player/Player';
import styles from './PokerTable.module.css';


export default function PokerTable({ state } : { state: GameState; }) {
    const [show, setShow] = useState<boolean>(false);

    useEffect(() => {
        if (state.phase === 'showdown' && show === false) setShow(true);
        if (state.phase === 'inHand' && show === true) setShow(false);
    }, [state] );

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
                {state.currentBet > 0 && <p>Amount to call: {state.currentBet}</p>}
                <div className={styles.community}>
                    {state.community.map((c, i) => {
                        return(
                            <Card key={`card ${i}`} card={c} />
                        )
                    })
                    }
                </div>
                <p>Whose turn: {state.players[state.currentPlayer].name} - Phase: {state.phase} - Street: {state.street}</p>
            </div>
        </div>
    )
}