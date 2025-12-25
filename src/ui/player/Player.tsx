import { actionToDisplay } from '../../poker/lib/actions';
import type { Player as PlayerType, Card as CardType, BotPlayer, GameState } from '../../types';
import Card from '../cards/Card';
import styles from './Player.module.css';

export default function Player({
    show,
    player,
    state
}: {
    show: boolean;
    player: BotPlayer;
    state: GameState;
}) {

    const isActive = state.phase === "inHand" && player.index === state.currentPlayer;
    const isDealer = state.dealerButton === player.tableIndex+1;

    const position = `bot${player.tableIndex}`

    return (
        <div className={`${styles.player} ${styles[position]}`}>
            <div className={styles.hand}>
                {!player.folded && player.hand.map((card: CardType, index: number) => {
                    const translation = index === 0 ? -15 : 15;
                    const rotation = index === 0 ? -8 : 8;
                    return (
                        <div
                            key={`user-card-${index}`}
                            className={styles.cardWrapper}
                            style={{ transform: `translateX(${translation}px) rotate(${rotation}deg)` }}
                        >
                            <Card card={card} back={!show} />
                        </div>
                )})}
            </div>
            <div className={`${styles.playerInfo} ${isActive ? styles.active: ""}`}>
                <h2 className={styles.name}>{player.name}</h2>
                <p className={styles.chips}>
                    Chips: {player.chips}
                </p>
                <p className={styles.bet}>
                    Total Bet: {player.totalBet}
                </p>
                {isDealer && <div className={styles['dealer']} />}
            </div>
            {player.displayedAction && 
                <div className={styles.actionPopup} role="status" aria-live="polite">
                    {player.displayedAction}
                </div>
            }
        </div>
    );
}
