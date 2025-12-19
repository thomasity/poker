import { usePokerGame } from './ui/usePokerGame';
import PokerTable from './ui/table/PokerTable';
import UserControls from './ui/controls/UserControls';

export default function App() {
  const { state, dispatch, newGame, startHand } = usePokerGame();

  return (
    <div className="page-wrapper">
        <header>
            <div/>
            <h1 id="title">Poker Game</h1>
            <div>
              {state.phase === 'handOver' && <button onClick={startHand}>Start Hand</button>}
              <button onClick={newGame}>New Game</button>
            </div>
        </header>
        <main>
            <PokerTable state={state} />
        </main>
        <UserControls state={state} dispatch={dispatch} />
    </div>
  );
}
