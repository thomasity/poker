import { useState, useMemo, useEffect } from "react";
import type { GameState, Card as CardType } from "../../types";
import styles from "./ActionBar.module.css";
import Card from "../cards/Card";

type BettingControlsProps = {
  state: GameState;
  dispatch: (amount: number) => void;
  setIsBetting: (betting: boolean) => void;
};

function BettingControls({ state, dispatch, setIsBetting }: BettingControlsProps) {
  const player = state.players[0];
  const maxChips = Math.max(0, player.chips);

  const defaultBet = useMemo(() => {
    if (maxChips <= 0) return 0;
    const minLegal = Math.max(1, state.currentBet + 1);
    return Math.min(Math.max(1, minLegal), maxChips);
  }, [maxChips, state.currentBet]);

  const [amount, setAmount] = useState<number>(defaultBet);

  useEffect(() => setAmount(defaultBet), [defaultBet]);

  const canSubmit = maxChips > 0 && amount >= 1 && amount <= maxChips;

  const quick = [
    Math.min(maxChips, Math.max(1, Math.floor(maxChips * 0.25))),
    Math.min(maxChips, Math.max(1, Math.floor(maxChips * 0.5))),
    Math.min(maxChips, Math.max(1, Math.floor(maxChips * 0.75))),
    maxChips,
  ].filter((v, i, arr) => v > 0 && arr.indexOf(v) === i);

  return (
    <div className={styles.betGrid}>
      <div className={styles.betHeader}>
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setIsBetting(false)}>
          Back
        </button>

        <div className={styles.betPlayer}>
          <div className={styles.betPlayerName}>{player.name}</div>
          <div className={styles.betPlayerChips}>Chips: {player.chips}</div>
        </div>
      </div>

      <div className={styles.betBody}>
        <div className={styles.betLabelRow}>
          <span className={styles.betLabel}>Bet</span>
          <span className={styles.betAmount}>${amount}</span>
        </div>

        <input
          id="betSlider"
          className={styles.slider}
          type="range"
          min={maxChips > 0 ? 1 : 0}
          max={maxChips}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          disabled={maxChips <= 0}
        />

        <div className={styles.sliderScale}>
          <span>1</span>
          <span>{maxChips}</span>
        </div>

        <div className={styles.quickRow}>
          {quick.map((v) => (
            <button
              key={v}
              type="button"
              className={styles.pill}
              onClick={() => setAmount(v)}
              disabled={maxChips <= 0}
            >
              ${v}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`${styles.btn} ${styles.btnPrimary}`}
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

function ActionControls({
  state,
  onCall,
  onFold,
  setIsBetting,
}: {
  state: GameState;
  onCall: () => void;
  onFold: () => void;
  setIsBetting: (betting: boolean) => void;
}) {
  const allCalledOrUnset = state.players.every(
    (p) => p.action === undefined || p.action.type === "call"
  );

  return (
    <div className={styles.actionRow}>
      <button className={`${styles.btn} ${styles.btnDanger}`} onClick={onFold}>
        Fold
      </button>
      <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onCall}>
        {allCalledOrUnset ? "Check" : "Call"}
      </button>
      <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsBetting(true)}>
        {allCalledOrUnset ? "Bet" : "Raise"}
      </button>
    </div>
  );
}

export function ActionBar({
  state,
  onFold,
  onCall,
  onBet,
}: {
  state: GameState;
  onFold: () => void;
  onCall: () => void;
  onBet: (amount: number) => void;
}) {
  const [isBetting, setIsBetting] = useState(false);
  const canAct = state.phase === "inHand" && state.players[state.currentPlayer]?.kind === "human";
  const player = state.players.find((p) => p.kind === "human")!;
  const isDealer = state.dealerButton !== undefined ? state.dealerButton === player.index : false;

  const actionStyle =
    player.displayedAction
      ? player.displayedAction[0] === "B" || player.displayedAction[0] === "R"
        ? "bet"
        : player.displayedAction[0] === "F"
          ? "fold"
          : "call"
      : "";

  return (
    <div className={styles.controlsContainer}>
      <div
        className={`${styles.displayedAction} ${styles[actionStyle] ?? ""} ${
          player.displayedAction ? styles.visible : ""
        }`}
      >
        {player.displayedAction}
      </div>

      <div className={`${styles.controls} ${canAct ? styles.active : ""}`}>
        <div className={styles.userInfo}>
          <div className={styles.userTop}>
            <div className={styles.userLabel}>Your Stack</div>
            {isDealer && <div className={styles.dealerPill}>Dealer</div>}
          </div>
          <div className={styles.userValue}>${player.chips}</div>
        </div>

        <div className={styles.actions}>
          {canAct ? (
            isBetting ? (
              <BettingControls state={state} dispatch={onBet} setIsBetting={setIsBetting} />
            ) : (
              <ActionControls state={state} onCall={onCall} onFold={onFold} setIsBetting={setIsBetting} />
            )
          ) : (
            <div className={styles.waiting}>Waiting…</div>
          )}
        </div>

        <div className={styles.hand}>
          {!player.folded &&
            player.hand.map((card: CardType, index: number) => (
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
