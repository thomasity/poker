import type { GameState, PlayerAction } from "../../types";

export function chooseBasicAction(state: GameState): PlayerAction {
    return { type: "call" };
//   const player = state.players[state.currentPlayer];

//   if (player.folded || player.chips === 0) {
//     return { type: "call" };
//   }

//   const toCall = Math.max(0, state.currentBet - player.currentBet);

//   if (toCall === 0) {
//     if (Math.random() < 0.7) {
//       return { type: "call" };
//     }

//     const bet = Math.max(1, Math.floor(player.chips * 0.1));
//     return { type: "bet", amount: bet };
//   }

//   if (toCall < player.chips) {
//     if (Math.random() < 0.8) {
//       return { type: "call" };
//     }

//     return { type: "fold" };
//   }

//   return { type: "all-in" };
}
