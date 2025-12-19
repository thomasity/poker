import type { Card as CardType } from '../../types';

function cardUrl(card: CardType) {
    return `/cards/${card.suit}${card.rank}.svg`
}

export default function Card({ card } : { card: CardType }) {
    const url = cardUrl(card);
    if (!url) return null;

    return (
        <img 
            src={url} 
            alt={`${card.rank} of ${card.suit}`} 
            style={{ width: 80, height: "auto" }}
            draggable={false}
        />
    )
}