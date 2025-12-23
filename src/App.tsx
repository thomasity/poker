import { usePokerGame } from './ui/usePokerGame';
import PokerTable from './ui/table/PokerTable';
import UserControls from './ui/controls/UserControls';
import ConfigTable from './ui/table/PokerTable.config';
import ClickAnywhere from './ui/ClickAnywhere';

export default function App() {
  const { state, dispatch, startGame, endGame, startHand, canAct } = usePokerGame();

  return (
    <div className="page-wrapper">
        { state.phase === 'handOver' && state.playing && <ClickAnywhere state={state} onClick={startHand} /> }
        <header>
            <div/>
            <h1 id="title">Poker Game</h1>
            {state.playing && state.handWinner !== undefined && <button onClick={endGame}>New Game</button>}
        </header>
        <main>
            {state.playing ? <PokerTable state={state} /> : <ConfigTable state={state} startGame={startGame} />}
        </main>
        <UserControls state={state} canAct={canAct} dispatch={dispatch} />
    </div>
  );
}
