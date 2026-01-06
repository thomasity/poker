import type { GameState, PlayerAction, Player } from "../../types";


export function actionToDisplay(state: GameState, player: Player, action?: PlayerAction) : string {
    if (!action) return "";

    switch (action.type) {
        case "fold":
            return "Fold";
        
        case "all-in":
            return "All In";
        
        case "call": {
            return (player.currentBet === state.currentBet) ? "Check" : "Call";
        }
        
        case "bet":
            if (state.currentBet === 0) return `Bet $${action.amount}`;
            return `Raise to $${player.currentBet + action.amount}`;
        
        default:
            return "";
    }
}