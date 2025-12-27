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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', justifyContent: 'center' }}>
              <a id="logo" href="https://tommycallen.com"><img src='/logo.png' alt='Logo' width={128} /></a>
              <h1 id="title" style={{ lineHeight: '0.25'}}>Poker Game <span style={{ fontSize: '12px', lineHeight: '0' }}><br />*This game is nowhere close to being fully complete/functional at the moment. Plz do not go all-in, assume big/small blinds do anything, or try running this on mobile...</span></h1>
            </div>
            <div style={{ gridColumn: '3', justifySelf: 'center' }}>
            {state.playing ? <button onClick={endGame}>New Game</button> : <div />}
            </div>
        </header>
        <main>
            {state.playing ? <PokerTable state={state} /> : <ConfigTable state={state} startGame={startGame} />}
        </main>
        <UserControls state={state} canAct={canAct} dispatch={dispatch} />
    </div>
  );
}
