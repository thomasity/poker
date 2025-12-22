import { useState, useMemo, useEffect } from "react";
import type { GameState, PlayerAction, Card as CardType } from "../../types";
import styles from "./UserControls.module.css";
import Card from "../cards/Card";

type BettingControlsProps = {
    state: GameState;
    dispatch: (action: PlayerAction) => void;
    setIsBetting: (betting: boolean) => void;
};

function BettingControls({ state, dispatch, setIsBetting } : BettingControlsProps) {
    const player = state.players[0];
    const maxChips = Math.max(0, player.chips);
    const defaultBet = useMemo(() => {
        if (maxChips <= 0) return 0;
        const minLegal = Math.max(1, state.currentBet + 1);
        return Math.min(Math.max(1, minLegal), maxChips);
    }, [maxChips, state.currentBet]);

    const [amount, setAmount] = useState<number>(defaultBet);

    useEffect(() => {
        setAmount(defaultBet);
    }, [defaultBet]);

    const canSubmit = maxChips > 0 && amount >= 1 && amount <= maxChips;

    return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
        <button type="button" onClick={() => setIsBetting(false)}>
          Back
        </button>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 600 }}>{player.name}</div>
          <div style={{ opacity: 0.8 }}>Chips: {player.chips}</div>
        </div>
      </div>

      <div>
        <label htmlFor="betSlider" style={{ display: "block", marginBottom: "0.25rem" }}>
          Bet amount: <strong>{amount}</strong>
        </label>

        <input
          id="betSlider"
          type="range"
          min={maxChips > 0 ? 1 : 0}
          max={maxChips}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          disabled={maxChips <= 0}
          style={{ width: "100%" }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", opacity: 0.8 }}>
          <span>1</span>
          <span>{maxChips}</span>
        </div>
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => {
          dispatch({ type: "bet", amount });
          setIsBetting(false);
        }}
      >
        Submit
      </button>
    </div>
  );
}

function ActionControls({ state, dispatch, setIsBetting } : { state: GameState, dispatch: (action: PlayerAction) => void, setIsBetting: (betting: boolean) => void }) {
    if (state.players.every(player => player.action === undefined)) {
        return (
            <div>
                <button onClick={() => dispatch({ type: "call" })}>Check</button>
                <button onClick={() => setIsBetting(true)}>Bet</button>
                <button onClick={() => dispatch({ type: "fold" })}>Fold</button>
            </div>
        )
    }
    else {
        <div>
            <button onClick={() => dispatch({ type: "fold" })}>Fold</button>
            <button onClick={() => dispatch({ type: "call" })}>Call</button>
            <button onClick={() => setIsBetting(true)}>Raise</button>
        </div>
    }
}

export default function UserControls({ state, dispatch } : { state: GameState, dispatch: (action: PlayerAction) => void }) {
    const [isBetting, setIsBetting] = useState<boolean>(false);
    const player = state.players[0];

        return (
            <div className={styles['controls-container']}>
                <div id={styles.controls}>
                    <div>
                        <h2>{player.name}</h2>
                        <p>Chips: {player.chips}</p>
                        <p>Current Bet: {state.currentBet}</p>
                    </div>
                    {state.currentPlayer === 0 && state.phase === 'inHand' ? isBetting ? (
                        <BettingControls state={state} dispatch={dispatch} setIsBetting={setIsBetting} />
                    ) : (
                        <ActionControls state={state} dispatch={dispatch} setIsBetting={setIsBetting} />
                    ) : <div/> }
                    <div className={styles.hand}>
                        {player.hand.map((card: CardType, index: number) => (
                            <div
                                key={`user-card-${index}`}
                                className={styles.cardWrapper}
                                style={{ transform: `translateX(${index * 30}px)` }}
                            >
                                <Card card={card} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
}