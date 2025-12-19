import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameState, PlayerAction } from '../types';
import * as engine from '../engine/pokerEngine';
import * as bots from '../bots';

export function usePokerGame() {
    const [state, setState] = useState<GameState>(() => engine.initGame());
    const botTimerRef = useRef<number | null>(null);

    const newGame = useCallback(() => {
        setState(engine.initGame());
    }, []);

    const dispatch = useCallback((action: PlayerAction) => {
        setState(prev => engine.applyAction(prev, action));
    }, []);

    const startHand = useCallback(() => {
        setState(prev => engine.startHand(prev));
    }, []);

    const currentPlayer = state.players[state.currentPlayer];
    const isBotTurn = currentPlayer.kind === "bot";
    const canAct = state.phase === "inHand";

    useEffect(() => {
        if (botTimerRef.current != null) {
            clearTimeout(botTimerRef.current);
            botTimerRef.current = null;
        }
        if (isBotTurn) console.log("bots turn!");
        if (!canAct || !isBotTurn) {
            console.log("waiting...")
            return;
        }

        const botAction = bots.chooseAction(state);
        botTimerRef.current = setTimeout(() => {
            dispatch(botAction);
        }, 3000);

        return () => {
            if (botTimerRef.current != null) {
                clearTimeout(botTimerRef.current);
                botTimerRef.current = null;
            }
        };
    }, [canAct, isBotTurn, state, dispatch]);

    return { state, dispatch, newGame, startHand }
}