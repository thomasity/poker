import { useState } from 'react';
import type { BotPlayer, GameState, PregameConfig } from '../../types'
import Player from '../player/Player.config';
import AddBotButton from '../config/AddBotButton';
import { TableConfigForm } from '../config/TableConfigForm';
import styles from './PokerTable.module.css';


export default function PokerTable({ state, startGame } : { state: GameState; startGame: (config: PregameConfig) => void; }) {
    const [opponents, setOpponents] = useState<(BotPlayer | null)[]>(new Array(5).fill(null));
    const [error, setError] = useState<string>("");

    const handleStartGame = (config: PregameConfig) => {
        if (opponents.every(o => o === null)) {
            setError("Cannot begin game without bot opponents.");
        }
        else {
            const players = opponents.filter(o => o !== null);
            setError("");
            startGame({ ...config, players } );
        }
    }

    const addBot = (index: number) => {
        setError("");
        const bot :  BotPlayer = {
            id: `${index}`,
            name: `Bot ${index}`,
            index: index,
            chips: 1000,
            hand: [],
            folded: false,
            currentBet: 0,
            totalBet: 0,
            kind: "bot",
            botProfile: "basic",
            tableIndex: index + 1
        }
        setOpponents(prev => {
            const next = [...prev];
            next[index] = {...bot};
            return next;
        })
    }

    const removeBot = (index: number) => {
        setOpponents(prev => {
            const next = [...prev];
            next[index] = null;
            return next;
        })
    }

    if (!state) {
        return <div id={styles.table}></div>;
    }
    return (
        <div id={styles.table}>
            {Array.from({ length: 5 }).map((_, index) => {
                const bot = opponents[index];

                return (bot !== null) ? (
                    <Player
                        key={`bot-${index}`}
                        index={index}
                        removeBot={removeBot}
                    />
                ) : (
                    <AddBotButton
                        key={`add-bot-${index}`}
                        index={index}
                        onClick={addBot}
                    />
                );
            })}
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