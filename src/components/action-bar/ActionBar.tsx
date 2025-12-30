import { useState, useMemo, useEffect } from "react";
import type { GameState, Card as CardType } from "../../types";
import styles from "./ActionBar.module.css";
import Card from "../cards/Card";

type BettingControlsProps = {
    state: GameState;
    dispatch: (amount: number) => void;
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
          dispatch(amount);
          setIsBetting(false);
        }}
      >
        Submit
      </button>
    </div>
  );
}

function ActionControls({ state, onCall, onFold, setIsBetting } : { state: GameState, onCall: () => void, onFold: () => void, setIsBetting: (betting: boolean) => void }) {
    if (state.players.every(player => player.action === undefined)) {
        return (
            <div>
                <button onClick={onCall}>Check</button>
                <button onClick={() => setIsBetting(true)}>Bet</button>
                <button onClick={onFold}>Fold</button>
            </div>
        )
    }
    else {
        return (
          <div>
              <button onClick={onFold}>Fold</button>
              <button onClick={onCall}>Call</button>
              <button onClick={() => setIsBetting(true)}>Raise</button>
          </div>
        )
    }
}

export function ActionBar({
  state,
  onFold,
  onCall,
  onBet
}: {
  state: GameState;
  onFold: () => void;
  onCall: () => void;
  onBet: (amount: number) => void;
}) {
  const [isBetting, setIsBetting] = useState(false);
  const canAct = state.phase === "inHand" && state.players[state.currentPlayer]?.kind === "human";
  const player = state.players.find(p => p.kind === "human")!;
  const actionStyle = player.displayedAction ? player.displayedAction[0] === "B" || player.displayedAction[0] === "R" ? "bet" :
                      player.displayedAction[0] === "F" ? "fold" :
                      "call" : "";
  const isDealer = state.dealerButton !== undefined ? state.dealerButton === player.index : false;

  return (
    <div className={styles.controlsContainer}>
        <div
          className={`${styles.displayedAction} ${styles[actionStyle] ?? ""} ${
            player.displayedAction ? styles.visible : ""
          }`}
        >
          {player.displayedAction}
        </div>
      <div className={`${styles.controls} ${canAct ? styles.active : "" }`}>
        <div className={styles.userInfo}>
          <h2>Chips: ${player.chips}</h2>
          {isDealer && <div>Dealer</div>}
        </div>

        <div className={styles.actions}>
          {canAct ? (
            isBetting ? (
              <BettingControls 
                state={state} 
                dispatch={onBet} 
                setIsBetting={setIsBetting} 
              />
            ) : (
              <ActionControls 
                state={state} 
                onCall={onCall} 
                onFold={onFold}
                setIsBetting={setIsBetting} 
              />
            )
          ) : (
            <div />
          )}
        </div>

        <div className={styles.hand}>
          {!player.folded && player.hand.map((card: CardType, index: number) => (
            <div
              key={`user-card-${index}`}
              className={styles.cardWrapper}
              style={{ left: `${index * 30}px` }}
            >
              <Card card={card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}