import type { GameState, PlayerAction } from "../types";
import { chooseBasicAction } from "./strategies/basic";

export function chooseAction(state: GameState) : PlayerAction {
    const player = state.players[state.currentPlayer];

    if (player.kind !== "bot") {
        throw new Error("chooseAction called for non-bot player");
    }

    switch (player.botProfile) {
        case "random":
        case "tight":
        case "aggressive":
        default:
            return chooseBasicAction(state);
    }
}