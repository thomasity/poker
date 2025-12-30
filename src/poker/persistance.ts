import type { GameState } from '../types';
import { initGame } from './setup';

export function loadChips(): Record<string, number> | null {
    const raw = localStorage.getItem("poker_chips");
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function persistChips(state: GameState) {
    const chipsByPlayer = state.players.map(p => ({
        id: p.id,
        chips: p.chips
    }));

    localStorage.setItem("poker_chips", JSON.stringify(chipsByPlayer));
}

export function resumeGame(saved: Record<string, number>) : GameState {
    const state = initGame();

    return {
        ...state,
        players: state.players.map(p => ({
            ...p,
            chips: saved[p.id] ?? p.chips
        }))
    };
}