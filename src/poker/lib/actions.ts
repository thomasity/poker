import type { GameState, Player, PlayerAction } from "../../types";


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

            const raiseBy = Math.max(0, action.amount ?? 0);
            return raiseBy > 0 ? `Raise $${raiseBy}` : "Raise";
        
        default:
            return "";
    }
}