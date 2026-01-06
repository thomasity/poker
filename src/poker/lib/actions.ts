import type { GameState, PlayerAction, Player } from "../../types";


export function isCheckOrBet(state: GameState, player: Player) {
    const isBigBlind = player.index === state.bigBlindIndex!;
    return (state.currentBet === 0 || (state.currentBet === state.bigBlind && isBigBlind));
}

export function actionToDisplay(state: GameState, player: Player, action?: PlayerAction) : string {
    if (!action) return "";

    switch (action.type) {
        case "fold":
            return "Fold";
        
        case "all-in":
            return "All In";
        
        case "call": {
            return isCheckOrBet(state, player) ? "Check" : "Call";
        }
        
        case "bet":
            if (isCheckOrBet(state, player)) return `Bet $${action.amount}`;
            return `Raise to $${player.currentBet + action.amount}`;
        
        default:
            return "";
    }
}