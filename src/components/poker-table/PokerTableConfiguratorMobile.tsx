import { useState } from 'react';
import type { GameState, PregameConfig } from '../../types'
import { TableConfigForm } from '../config/TableConfigForm';
import styles from './PokerTable.module.css';


export function PokerTableConfiguratorMobile({ state, startGame } : { state: GameState; startGame: (config: PregameConfig) => void; }) {
    const [error, setError] = useState<string>("");

    const handleStartGame = (config: PregameConfig) => {
        if (config.players.every(o => o === null)) {
            setError("Cannot begin game without bot opponents.");
        }
        else {
            const players = config.players.filter(o => o !== null);
            setError("");
            startGame({ ...config, players } );
        }
    }

    if (!state) {
        return <div id={styles.table}></div>;
    }
    return (
        <div id={styles.table}>

            <div className={styles['table-content']}>
                <TableConfigForm
                    initial={{ buyIn: 1000, smallBlind: 5, bigBlind: 10, players: [] }}
                    startGame={(config: PregameConfig) => {
                        handleStartGame(config);
                    }}
                />
                <div style={{ gridRow: 3, lineHeight: 1.5 }}>{error}</div>
            </div>
        </div>
    )
}