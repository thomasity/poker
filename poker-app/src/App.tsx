import { usePokerGame } from './ui/usePokerGame';
import PokerTable from './ui/table/PokerTable';
import UserControls from './ui/controls/UserControls';
import ConfigTable from './ui/table/PokerTable.config';

export default function App() {
  const { state, dispatch, startGame, canAct } = usePokerGame();

  return (
    <div className="page-wrapper">
        <header>
            <div/>
            <h1 id="title">Poker Game</h1>
        </header>
        <main>
            {state.playing ? <PokerTable state={state} /> : <ConfigTable state={state} startGame={startGame} />}
        </main>
        <UserControls state={state} dispatch={dispatch} />
    </div>
  );
}
