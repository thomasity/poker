import styles from './Player.module.css';

export default function Player({
    position,
    removeBot
}: {
    position: string;
    removeBot?: () => void;
}) {
    return (
        <div className={`${styles.player} ${styles[position]}`}>
            <div className={styles.playerInfo}>
                <h2 className={styles.name}>{position}</h2>
                <p className={styles.chips}>
                    Chips: 1000
                </p>
                <p className={styles.bet}>
                    Total Bet: 0
                </p>
                {removeBot && <button className={styles['remove-bot']} onClick={removeBot} />}
            </div>
        </div>
    );
}
