import type { Player as PlayerType, Card as CardType } from '../../types';
import Card from '../cards/Card';
import styles from './Player.module.css';

export default function Player({
    position,
    player
}: {
    position: string;
    player: PlayerType;
}) {
    return (
        <div className={`${styles.player} ${styles[position]}`}>
            <div className={styles.hand}>
                {player.hand.map((card: CardType, index: number) => (
                    <div
                        key={`user-card-${index}`}
                        className={styles.cardWrapper}
                        style={{ transform: `translateX(${index * 30}px)` }}
                    >
                        <Card card={card} back={player.kind === 'bot'} />
                    </div>
                ))}
            </div>
            <div className={styles.playerInfo}>
                <h2 className={styles.name}>{player.name}</h2>
                <p className={styles.bet}>
                    Current Bet: {player.currentBet}
                </p>
                <p className={styles.chips}>
                    Chips: {player.chips}
                </p>
            </div>
        </div>
    );
}
