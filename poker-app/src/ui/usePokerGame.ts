import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { GameState, PlayerAction, BotPlayer, GameEffect, GameEvent, PregameConfig } from '../types';
import * as engine from '../engine/pokerEngine';
import * as bots from '../bots';

export function usePokerGame() {
    const [state, setState] = useState<GameState>(() => engine.initGame());
    
    const timersRef = useRef<Map<"bot" | "hand" | "street", number>>(new Map());

    const clearTimer = useCallback((key: "bot" | "hand" | "street") => {
        const id = timersRef.current.get(key);
        if (id != null) {
        window.clearTimeout(id);
        timersRef.current.delete(key);
        }
    }, []);

    const clearAllTimers = useCallback(() => {
        for (const id of timersRef.current.values()) window.clearTimeout(id);
        timersRef.current.clear();
    }, []);
    
    const runEffects = useCallback(( effects: GameEffect[]) => {
        for (const effect of effects) {
            if (effect.type === "NONE") continue;

            if (effect.type === "AFTER") {
                const id = setTimeout(() => {
                    dispatchEvent(effect.event);
                }, effect.ms);
                timersRef.current.set(effect.key, id);
            }

            if (effect.type === "BOT_TURN_AFTER") {
                const id = setTimeout(() => {
                    setState(curr => {
                        const botAction = bots.chooseAction(curr);
                        if (botAction === null) return curr;
                        const { state: next, effects: nextEffects } = engine.reduceGame(curr, { type: "BOT_ACTION", action: botAction });

                        queueMicrotask(() => runEffects(nextEffects));

                        return next;
                    });
                }, effect.ms);
                timersRef.current.set(effect.key, id);
            }
        }
    }, [clearTimer]);

    const dispatchEvent = useCallback((event: GameEvent) => {
        setState(prev => {
            const { state: next, effects } = engine.reduceGame(prev, event);

            queueMicrotask(() => runEffects(effects));

            return next;
        })
    }, [runEffects]);

    const dispatch = useCallback((action: PlayerAction) => {
        dispatchEvent({ type: "PLAYER_ACTION", action});
    }, [dispatchEvent]);

    const startGame = useCallback((config: PregameConfig) => {
        console.log("Start game callback.");
        clearAllTimers();
        dispatchEvent({ type: "INITIATE_GAME", config });
    }, [clearAllTimers, dispatchEvent]);

    useEffect(() => clearAllTimers, [clearAllTimers]);

    const canAct = useMemo(() => state.phase === "inHand" && state.players[state.currentPlayer]?.kind === "human", [state]);
    const isBotTurn = useMemo(() => state.phase === "inHand" && state.players[state.currentPlayer]?.kind === "bot", [state]);
    
    return { state, dispatch, dispatchEvent, startGame, canAct, isBotTurn }
}