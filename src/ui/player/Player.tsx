import type { Player as PlayerType, Card as CardType } from '../../types';
import Card from '../cards/Card';
import styles from './Player.module.css';

export default function Player({
    position,
    show,
    player
}: {
    position: string;
    show: boolean;
    player: PlayerType;
}) {
    const actionLabel =
    player.action?.type === "bet" ? `Bet` :
    player.action?.type === "call" ? `Call` :
    player.action?.type === "fold" ? `Fold` :
    player.action?.type ?? "";

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
            <div className={styles.playerInfo}>
                <h2 className={styles.name}>{player.name}</h2>
                <p className={styles.chips}>
                    Chips: {player.chips}
                </p>
                <p className={styles.bet}>
                    Total Bet: {player.totalBet}
                </p>
            </div>
            {actionLabel && 
                <div className={styles.actionPopup} role="status" aria-live="polite">
                    {actionLabel}
                </div>
            }
        </div>
    );
}
