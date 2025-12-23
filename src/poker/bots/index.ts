import type { GameState, PlayerAction } from "../../types";
import { chooseBasicAction } from "./strategies/basic";

export function chooseAction(state: GameState) : PlayerAction | null {
    const player = state.players[state.currentPlayer];

    if (player.kind !== "bot") {
        return null;
    }

    switch (player.botProfile) {
        case "random":
        case "tight":
        case "aggressive":
        default:
            return chooseBasicAction(state);
    }
}