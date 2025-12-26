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
        {/* <div id="debug" style={{ position: 'absolute', top: 0, left: 0, maxHeight: '50vh', overflowY: 'scroll', fontSize: '10px' }}>
            <pre>{JSON.stringify(state, null, 2)}</pre>
        </div> */}
        <header>
            <div/>
            <h1 id="title">Poker Game</h1>
            {state.playing && <button onClick={endGame}>New Game</button>}
        </header>
        <main>
            {state.playing ? <PokerTable state={state} /> : <ConfigTable state={state} startGame={startGame} />}
        </main>
        <UserControls state={state} canAct={canAct} dispatch={dispatch} />
    </div>
  );
}
