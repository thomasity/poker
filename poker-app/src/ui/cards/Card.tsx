import type { Card as CardType } from '../../types';

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
                style={{ width: 80, height: "auto" }}
                draggable={false}  
            />
        )
    }
    return (
        <img 
            src={url} 
            alt={`${card.rank} of ${card.suit}`} 
            style={{ width: 80, height: "auto" }}
            draggable={false}
        />
    )
}