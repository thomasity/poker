import React, { useMemo, useState } from "react";
import styles from "./TableConfigForm.module.css";
import type { PregameConfig } from "../../types";

type Props = {
  initial?: PregameConfig;
  startGame: (config: PregameConfig) => void;
  isStarting?: boolean;
};

export function TableConfigForm({ initial, startGame, isStarting }: Props) {
  const [buyIn, setBuyIn] = useState(String(initial?.buyIn ?? 1000));
  const [smallBlind, setSmallBlind] = useState(String(initial?.smallBlind ?? 5));
  const [bigBlind, setBigBlind] = useState(String(initial?.bigBlind ?? 10));

  const config = useMemo(() => {
    const toInt = (s: string) => Number.parseInt(s, 10);
    return { buyIn: toInt(buyIn), smallBlind: toInt(smallBlind), bigBlind: toInt(bigBlind), players: []};
  }, [buyIn, smallBlind, bigBlind]);

  const error = useMemo(() => {
    const { buyIn, smallBlind, bigBlind } = config;

    if (![buyIn, smallBlind, bigBlind].every(Number.isFinite)) return "All values must be numbers.";
    if ([buyIn, smallBlind, bigBlind].some(v => v <= 0)) return "All values must be greater than 0.";
    if (bigBlind <= smallBlind) return "Big blind must be greater than small blind.";
    if (bigBlind % smallBlind !== 0) return "Big blind should be a multiple of small blind.";
    if (buyIn < bigBlind * 20) return "Buy-in is too small (recommend at least 20× big blind).";

    return null;
  }, [config]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (error || isStarting) return;
    startGame(config);
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h3 className={styles.title}>Table Settings</h3>

      <div className={styles.row}>
        <div className={styles.field}>
          <div className={styles.label}>Buy-in (starting chips)</div>
          <input
            className={styles.input}
            inputMode="numeric"
            pattern="[0-9]*"
            value={buyIn}
            onChange={(e) => setBuyIn(e.target.value)}
            disabled={isStarting}
          />
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Small blind</div>
          <input
            className={styles.input}
            inputMode="decimal"
            pattern="[0-9]*"
            value={smallBlind}
            onChange={(e) => setSmallBlind(e.target.value)}
            disabled={isStarting}
          />
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Big blind</div>
          <input
            className={styles.input}
            inputMode="numeric"
            pattern="[0-9]*"
            value={bigBlind}
            onChange={(e) => setBigBlind(e.target.value)}
            disabled={isStarting}
          />
        </div>
      </div>

      <div className={styles.errorSlot}>
        {error && <div className={styles.error}>{error}</div>}
      </div>

      <div className={styles.actions}>
        <button className={styles.submit} type="submit" disabled={!!error || isStarting}>
          {isStarting ? "Starting…" : "Start game"}
        </button>
      </div>
    </form>
  );
}
