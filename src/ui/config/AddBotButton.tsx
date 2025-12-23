import styles from '../player/Player.module.css';
import configStyles from './Config.module.css';

export default function AddBotButton({
    position,
    onClick
}: {
    position: string;
    onClick: () => void;
}) {
    return (
        <div className={`${styles.player} ${styles[position]}`}>
            <button onClick={onClick} className={configStyles['add-bot-button']}>
                <div className={configStyles['plus']}>+</div>
                <div className={configStyles['add-bot']}>Add Bot</div>
            </button>
        </div>
    );
}
