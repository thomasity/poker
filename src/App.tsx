import { usePokerGame } from './components/hooks/usePokerGame';
import { ActionBar } from './components/action-bar';
import { PokerTableConfigurator, PokerTableConfiguratorMobile, PokerTableDefault, PokerTableMobile } from './components/poker-table';
import ClickAnywhere from './components/ClickAnywhere';
import useIsMobile from './components/hooks/useIsMobile';

export default function App() {
  const { state, dispatchPlayerAction, startGame, endGame, startHand } = usePokerGame();
  const playing = state.phase !== 'setup' && !state.isGameOver;
  const isMobile = useIsMobile();

  return (
    <div className="page-wrapper">
        { state.phase === 'handOver' && <ClickAnywhere state={state} onClick={startHand} /> }
        {!isMobile && (
          <header>
              <div className="logo-container">
                <a id="logo" href="https://tommycallen.com"><img src='/logo.png' alt='Logo' width={128} /></a>
              </div>
              <div className="new-game-button">
              {playing? <button onClick={endGame}>New Game</button> : <div />}
              </div>
          </header>
        ) }
        <main>
            {state.phase === 'setup' ? 
                ( isMobile ? <PokerTableConfiguratorMobile state={state} startGame={startGame} /> : <PokerTableConfigurator state={state} startGame={startGame} /> )
                : ( isMobile ? <PokerTableMobile state={state} /> : <PokerTableDefault state={state} />)}
        </main>
        {state.phase !== 'setup' ? 
            <ActionBar 
                state={state}
                onFold={() => dispatchPlayerAction({ type: "fold" })}
                onCall={() => dispatchPlayerAction({ type: "call" })}
                onBet={(amount: number) => dispatchPlayerAction({ type: "bet", amount })}
            />
            :
            null
        }
    </div>
  );
}
