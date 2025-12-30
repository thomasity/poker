import type { Card as CardType } from '../../types';
import styles from './Card.module.css';

function cardUrl(card: CardType) {
    return `/cards/${card.suit}${card.rank}.svg`
}

export default function Card({ card, back } : { card: CardType, back?: boolean }) {
    const url = cardUrl(card);
    if (!url) return null;  

    if (back === true) {
        return (
            <img 
                src="/cards/redBack.svg" 
                alt="blue card back" 
                className={styles.card}
                draggable={false}  
            />
        )
    }
    return (
        <img 
            src={url} 
            alt={`${card.rank} of ${card.suit}`} 
            className={styles.card}
            draggable={false}
        />
    )
}