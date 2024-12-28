import React, { useState } from 'react';
import HostView from './components/HostView';
import PlayerView from './components/PlayerView';
import FlagCarousel from './components/FlagCarousel';

function App() {
  const [view, setView] = useState(null);

  if (!view) {
    return (
      <div className="home-container">
        <div className="hero-section">
          <FlagCarousel />
          <div className="hero-content">
            <h1 className="title">Guess The Flag</h1>
            <p className="subtitle">Test your knowledge of world flags in this multiplayer game!</p>
          </div>
        </div>

        <div className="card action-card">
          <div className="button-container">
            <button 
              className="action-button host-button"
              onClick={() => setView('host')}
            >
              <span className="button-icon">🎮</span>
              Host Game
              <span className="button-description">Create a new game session</span>
            </button>
            <button 
              className="action-button join-button"
              onClick={() => setView('player')}
            >
              <span className="button-icon">👥</span>
              Join Game
              <span className="button-description">Enter an existing game session</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      {view === 'host' ? (
        <HostView isHost={true} />
      ) : (
        <PlayerView />
      )}
      <button 
        className="back-button"
        onClick={() => setView(null)}
      >
        <span className="button-icon">←</span>
        Back to Menu
      </button>
    </div>
  );
}

export default App; 