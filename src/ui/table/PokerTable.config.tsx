import { useState } from 'react';
import type { BotPlayer, GameState, PregameConfig } from '../../types'
import Player from '../player/Player.config';
import AddBotButton from '../config/AddBotButton';
import { TableConfigForm } from '../config/TableConfigForm';
import styles from './PokerTable.module.css';


export default function PokerTable({ state, startGame } : { state: GameState; startGame: (config: PregameConfig) => void; }) {
    const [opponents, setOpponents] = useState<BotPlayer[]>(state.players.filter(p => p.kind === 'bot'));
    const [error, setError] = useState<string>("");

    const handleStartGame = (config: PregameConfig) => {
        if (opponents.length === 0) {
            setError("Cannot begin game without bot opponents.");
        }
        else {
            config.players = opponents;
            setError("");
            startGame(config);
        }
    }

    const addBot = () => {
        setError("");
        const bot :  BotPlayer = {
            id: `${opponents.length + 1}`,
            name: `Bot ${opponents.length + 1}`,
            chips: 1000,
            hand: [],
            folded: false,
            currentBet: 0,
            totalBet: 0,
            kind: "bot",
            botProfile: "basic"
        }
        setOpponents([...opponents, bot]);
    }

    const removeBot = () => {
        setOpponents(prev => prev.slice(0, -1));
    }

    if (!state) {
        return <div id={styles.table}></div>;
    }
    return (
        <div id={styles.table}>
            {Array.from({ length: Math.min(opponents.length + 1, 5) }).map((_, index) => {
                const bot = opponents[index];
                const position = `bot${index + 1}`

                return bot ? (
                    <div>
                        <Player
                        key={`bot-${index}`}
                        position={position}
                        removeBot={index === opponents.length - 1 ? removeBot : undefined}
                        />
                    </div>
                ) : (
                    <AddBotButton
                        key={`add-bot-${index}`}
                        position={position}
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
                <p style={{ gridRow: 3}}>{error}</p>
            </div>
        </div>
    )
}