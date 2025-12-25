import styles from './Player.module.css';

export default function Player({
    index,
    removeBot
}: {
    index: number;
    removeBot?: (index: number) => void;
}) {
    const position = `bot${index+1}`
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
                {removeBot && <button className={styles['remove-bot']} onClick={() => removeBot(index)} />}
            </div>
        </div>
    );
}
