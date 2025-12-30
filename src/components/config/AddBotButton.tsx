import styles from '../player/Player.module.css';
import configStyles from './Config.module.css';

export default function AddBotButton({
    index,
    onClick
}: {
    index: number;
    onClick: (index: number) => void;
}) {
    const position = `bot${index+1}`;
    return (
        <div className={`${styles.player} ${styles[position]}`}>
            <button onClick={() => onClick(index)} className={configStyles['add-bot-button']}>
                <div className={configStyles['plus']}>+</div>
                <div className={configStyles['add-bot']}>Add Bot</div>
            </button>
        </div>
    );
}
