import type { GameState, PlayerAction } from "../../types";


export function actionToDisplay(state: GameState, action?: PlayerAction) : string {
    if (!action) return "";

    switch (action.type) {
        case "fold":
            return "Fold";
        
        case "all-in":
            return "All In";
        
        case "call":
            return state.currentBet === 0 ? "Check" : "Call";
        
        case "bet":
            if (state.currentBet === 0) return `Bet $${action.amount}`;
            return `Raise to $${action.amount}`;
        
        default:
            return "";
    }
}