import './App.scss';
import Music from './Music';

function App() {
  return (
    <div className="App">
      <header>
        <img src='/images/player-96.png' alt='Jukebox Logo'/>
        <h1>Jukebox</h1>
      </header>
      <Music />
    </div>
  );
}

export default App;
