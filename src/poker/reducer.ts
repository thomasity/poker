/**
 * Poker  Engine
 * - reduceGame
 * - startHand / endHand / startShowdown
 * - applyAction
 * - advanceStreet / readyToAdvanceStreet
 */

import type { GameState, GameEffect, PlayerAction, GameEvent } from '../types';
import { createDeck, shuffleDeck } from './deck';
import { evaluateHands, compareHands } from './hand';
import { actionToDisplay } from './lib/actions';
import { initGame, startGame } from './setup';

/**
 * Reducer for the poker game state machine.
 *
 * Takes the current `GameState` plus an incoming `GameEvent` and returns:
 * - the next `state` (synchronously computed), and
 * - a list of `effects` describing deferred work (timers / bot turns / follow-up events)
 *   that the caller should schedule and later dispatch back into this reducer.
 *
 * Key behaviors:
 * - `INITIATE_GAME`: initializes a new game from `event.config` and schedules `START_NEXT_HAND`.
 * - `START_NEXT_HAND`: deals/reset state for a new hand.
 * - `PLAYER_ACTION` / `BOT_ACTION`: applies an action only when `state.phase === "inHand"`.
 *   After the action, it may schedule:
 *   - `END_HAND` if only one player remains,
 *   - `ADVANCE_STREET` if all active players have matched the current bet,
 *   - a delayed bot turn if the next player is a bot.
 * - `ADVANCE_STREET`: advances the board street; on the river, may schedule showdown.
 * - `START_SHOWDOWN`: evaluates hand values and schedules `END_HAND`.
 * - `END_HAND`: awards the pot and transitions to hand-over state.
 * - `END_GAME`: resets to a fresh initial state.
 *
 * Notes:
 * - Events that are not valid for the current phase are treated as no-ops and return `{ state, effects: [] }`.
 * - Effects are declarative descriptions; this function does not execute timers or bot logic itself.
 *
 * @param state - Current game state before handling the event.
 * @param event - The event to reduce (user action, bot action, phase transitions, etc.).
 * @returns An object containing the next `state` and any scheduled `effects` for the caller to run.
 */
export function reduceGame(state: GameState, event: GameEvent) : { state: GameState; effects: GameEffect[] } {
    switch(event.type) {
        case "INITIATE_GAME": {
            const next = startGame(state, event.config);
            return {
                state: next,
                effects: [{ type: "AFTER", ms: 0, event: { type: "START_NEXT_HAND" }, key: "hand" } ]
            }
        }
        case "START_NEXT_HAND": {
            const next = startHand(state);
            return {
                state: next,
                effects: []
            }
        }
        
        case "PLAYER_ACTION": {
            if (state.phase !== "inHand") {
                return { state, effects: [] };
            }

            const next = applyAction(state, event.action);

            const nextPlayerIsBot = next.phase === "inHand" && next.players[next.currentPlayer]?.kind === "bot";

            switch(readyToAdvanceStreet(next)) {
                case 1:
                    // Everyone else has folded. Winner takes all. No need for showdown.
                    return { state: next, effects: [{ type: "AFTER", ms: 1000, event: { type:"END_HAND" }, key: "hand" }]};
                case 2:
                    // Multiple players still active and everyone has matched current bet. Advance Street.
                    return { state: next, effects: [{ type: "AFTER", ms: 1000, event: { type: "ADVANCE_STREET" }, key: "street" }]};
                }
            return { state: next, effects: nextPlayerIsBot ? [{ type: "BOT_TURN_AFTER", ms: 2000, key: "bot" }] : [] };
        }


        case "BOT_ACTION": {
            if (state.phase !== "inHand") return { state, effects: [] };

            const next = applyAction(state, event.action);
            const nextPlayerIsBot = next.phase === "inHand" && next.players[next.currentPlayer]?.kind === "bot";
            
            switch(readyToAdvanceStreet(next)) {
                case 1:
                    // Everyone else has folded. Winner takes all. No need for showdown.
                    return { state: next, effects: [{ type: "AFTER", ms: 1000, event: { type:"END_HAND" }, key: "hand" }]};
                case 2:
                    // Multiple players still active and everyone has matched current bet. Advance Street.
                    return { state: next, effects: [{ type: "AFTER", ms: 1000, event: { type: "ADVANCE_STREET" }, key: "street" }]};
                }

            return { state: next, effects: nextPlayerIsBot ? [{ type: "BOT_TURN_AFTER", ms: 2000, key: "bot" }] : [] };
        }

        case "ADVANCE_STREET": {
            if (state.phase !== "inHand") return { state, effects: [] };
            
            if (state.street === 'river' && readyToAdvanceStreet(state) == 2) {
                return { state: state, effects: [{ type: "AFTER", ms: 1000, event: { type: "START_SHOWDOWN" }, key: "hand" }]};
            }
            else {
                const next = advanceStreet(state);
                const nextPlayerIsBot = next.phase === "inHand" && next.players[next.currentPlayer]?.kind === "bot";

                return { state: next, effects: nextPlayerIsBot ? [{ type: "BOT_TURN_AFTER", ms: 2000, key: "bot" }] : [] };
            }
        }

        case "START_SHOWDOWN": {

            const next = { ...state, players: evaluateHands(state), phase: 'showdown' as const }
            return {
                state: next,
                effects: [{ type: "AFTER", ms: 2000, event: { type: "END_HAND" }, key: "hand" } ]
            }
        }

        case "END_HAND": {
            const next = endHand(state);
            return {
                state: next,
                effects: []
            }
        }

        case "END_GAME": {
            return { state: initGame(), effects: [] };
        }

        default:
            return { state, effects: []};
    }
}

/** 
 * Applies a single player action (fold/call/bet) to the current hand and advances turn order.
 *
 * This function is *mostly* immutable: it returns a new `GameState` with a cloned `players` array.
 * However, if the current player has already acted this betting round (`player.action !== undefined`),
 * the action is ignored and the original `state` object is returned unchanged.
 *
 * Side effects / rules implemented:
 * - Ignores actions from a player who already has `action` set this round.
 * - `fold`: marks player folded, records action, and resets `currentBet`/`totalBet` for that player.
 * - `call`: pays up to the amount needed to match `state.currentBet` (capped by available chips),
 *   updates pot, and records action.
 * - `bet`: clears `action` for all players (starts a new betting round), clamps bet amount to
 *   `[0, player.chips]`, updates pot/currentBet, and records action.
 * - Advances `currentPlayer` to the next non-folded player (wraps around the table).
 *
 * @param state - The current game state.
 * @param action - The action to apply for `state.currentPlayer`.
 * @returns The updated game state after applying the action and moving to the next active player,
 *          or the original `state` if the current player already acted this round.
 */
function applyAction(state: GameState, action: PlayerAction): GameState {
  const players = state.players.map(p => ({ ...p }));
  const i = state.currentPlayer;
  const player = players[i];

  let pot = state.pot;
  let currentBet = state.currentBet;

  if (player.action !== undefined) {
    // already acted this round; ignore
    return state;
  }
  
  switch(action.type) {
      case "fold": {
          player.folded = true;
        player.action = { type: "fold" };
        player.currentBet = 0;
        player.totalBet = 0;
        break;
    }
    case "call": {
        const toCall = Math.max(0, currentBet - player.currentBet);
        const paid = Math.min(player.chips, toCall);
        player.chips -= paid;
        pot += paid;
        player.currentBet = paid;
        player.totalBet += paid;
        player.action = { type: "call" };
        break;
    }
    case "bet": {
        players.forEach(p => {
            p.displayedAction = undefined;
            p.action = undefined
        });
        const amt = Math.max(0, Math.min(player.chips, action.amount));
        player.chips -= amt;
        pot += amt;
        player.currentBet += amt;
        player.totalBet += amt;
        currentBet = Math.max(currentBet, player.currentBet);
        player.action = { type: "bet", amount: amt };
        break;
    }
    case "all-in":
        default:
            break;
    }
        
  player.displayedAction = actionToDisplay(state, action);
  let nextPlayer = (i + 1) % players.length;
  while (players[nextPlayer].folded) nextPlayer = (nextPlayer + 1) % players.length;

  return {
    ...state,
    players,
    pot,
    currentBet,
    currentPlayer: nextPlayer,
  };
}

function findFirstPlayer(state: GameState) : number {
    const dealer = state.dealerButton;
    let nextPlayer = (dealer + 1) % state.players.length;
    while(state.players[nextPlayer].folded || nextPlayer !== dealer) {
        nextPlayer = (nextPlayer + 1) % state.players.length;
    }
    return nextPlayer;
}

/**
 * Cleans up the table at the end of a hand by:
 * - Removing players with zero chips
 * - Resetting bets and hands for remaining players
 *
 * @param state - The GameState before cleanup.
 * @returns A GameState ready to begin the next betting round.
 */
export function startHand(state: GameState) : GameState {
    const deck = shuffleDeck(createDeck());
    const players = state.players.map(p => ({ ...p }));
    players.forEach(p => {
        p.currentBet = 0;
        p.totalBet = 0;
        p.action = undefined;
        p.folded = false;
        p.hand = [];
        p.handValue = undefined;
    });

    while (players.every(p => p.hand.length < 2)) {
        players.forEach(player => {
            if (player.hand.length < 2) {
                const card = deck.pop();
                if (card) {
                    if (player.hand.length === 0) {
                        player.hand = [card];
                    } else if (player.hand.length === 1) {
                        player.hand = [player.hand[0], card];
                    }
                }
            }
        });
    }

    const nextDealer = findFirstPlayer(state);
    const nextState : GameState = {
        ...state,
        deck,
        community: [],
        pot: 0,
        currentBet: 0,
        dealerButton: nextDealer,
        players,
        street: 'preflop',
        phase: 'inHand',
        handWinner: undefined
    }


    return {
        ...nextState,
        currentPlayer: findFirstPlayer(nextState)
    }
}

export function endHand(state: GameState): GameState {
    const players = state.players.map(p => ({ ...p }));
    const activeIndexes = players
        .map((p, i) => ({ p, i }))
        .filter(({ p }) => !p.folded && p.handValue !== undefined);

    const winnerEntry = activeIndexes.reduce((best, current) =>
        compareHands(current.p.handValue!, best.p.handValue!) > 0 ? current : best
    );

    players[winnerEntry.i].chips += state.pot;

    return {
        ...state,
        pot: 0,
        currentBet: 0,
        phase: "handOver",
        players,
        handWinner: winnerEntry.i
    };
}

function readyToAdvanceStreet(state : GameState) : number {
    const active = state.players.filter(p => !p.folded);
    if (active.length === 1) return 1;
    const allPlayersActed = active.every(p => p.action !== undefined);
    const allPlayersMatched = active.every(p => p.currentBet === state.currentBet);
    if (allPlayersActed && allPlayersMatched) return 2;
    return 0;

}

export function advanceStreet(state : GameState) : GameState {
    const players = state.players.map(p => ({ ...p }))
    const community = [...state.community];
    const deck = [...state.deck];
    let street = state.street;
    const nextPlayer = findFirstPlayer(state);

    if (state.players.every(p => p.action === undefined )) return { ...state };
    
    if (street === 'preflop' && community.length === 0) {
        for (let i = 0; i < 3; ++i) {
            const card = deck.pop();
            if (card) community.push(card);
        }
        street = 'flop';
        players.forEach(p => {
            p.action = undefined;
            p.displayedAction = undefined;
            p.currentBet = 0;
        });
        return { ...state, street, community, deck, players, currentBet: 0, currentPlayer: nextPlayer };
    }

    else if (street === 'flop' && community.length === 3) {
        const card = deck.pop();
        if (card) community.push(card);
        street = 'turn';
        players.forEach(p => {
            p.action = undefined;
            p.displayedAction = undefined;
            p.currentBet = 0;
        });
        return { ...state, street, community, deck, players, currentBet: 0, currentPlayer: nextPlayer };
    }

    else if (street === 'turn' && community.length === 4) {
        const card = deck.pop();
        if (card) community.push(card);
        street = 'river';
        players.forEach(p => {
            p.action = undefined;
            p.displayedAction = undefined;
            p.currentBet = 0;
        });
        return { ...state, street, community, deck, players, currentBet: 0, currentPlayer: nextPlayer };
    }

    return { ...state };
}
