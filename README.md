# Poker App (Texas Hold’em)

A browser-based Texas Hold’em poker game built with a pure TypeScript game engine and a React-based UI.  
The project emphasizes correctness, determinism, and a clean separation between game logic and presentation.

---

## Features

- Texas Hold’em rules engine
- Human and bot players
- Event-driven game reducer
- Declarative side effects (timers, bot turns)
- Hand evaluation and comparison
- Resume game from browser storage
- Modular, testable architecture

---

## Architecture Overview

The application is split into domain logic and presentation, with no UI logic inside the game engine.

The poker engine is implemented as a deterministic state machine driven by events.  
The UI layer is responsible for rendering state and executing side effects.

---

## Core Concepts

### Game Reducer

All game progression flows through a single reducer:


The reducer:
- applies poker rules
- validates events based on game phase
- schedules follow-up effects (bot turns, delayed transitions)

The reducer is pure and performs no I/O.

---

### Effects System

Side effects are described, not executed:

- delayed events (street transitions, hand end)
- bot turns

The UI layer is responsible for running timers and dispatching resulting events back into the reducer.

---

### Hand Evaluation

Hand logic is isolated and deterministic:

- evaluateHand(hand, community) -> HandValue
- compareHands(a, b) -> ordering

This logic is reused by showdown resolution and bots.

---

### Bots

Bots are pure decision policies:


They inspect the current state and return a valid action without mutating state or advancing turns.

---

### Persistence

Game state can be resumed from browser storage:

- storage access occurs outside the reducer
- hydrated state is validated before resuming
- reducer consumes resume events normally

---

## Tech Stack

- TypeScript
- React
- Vite

---

## Design Goals

- Clear separation of concerns
- Deterministic, debuggable game flow
- Easily extensible rules and bots
- Suitable for portfolio review and technical discussion

---

## Future Improvements

- Stronger bot strategies
- Odds calculation and simulations
- Multiplayer support
- Hand history and replay
- Additional betting structures

---

## License

MIT
