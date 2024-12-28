import React from 'react';

function WaitingRoom({ sessionCode, player, players, wsConnected, onMarkReady, onLeaveGame, isHost = false }) {
  return (
    <div className="waiting-screen">
      <div className="waiting-content">
        <h2>🎮 Waiting Room</h2>
        
        <div className="session-info">
          <p className="info-item">
            <span className="label">Session Code:</span>
            <span className="value">{sessionCode}</span>
          </p>
          <p className="info-item">
            <span className="label">Your Name:</span>
            <span className="value">{player.name}</span>
          </p>
          <div className={`connection-status ${wsConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot">{wsConnected ? '🟢' : '🔴'}</span>
            {wsConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {players && (
          <div className="players-list">
            <h3>Players ({players.length})</h3>
            {players.map((p) => (
              <div 
                key={p.id} 
                className={`player-item ${p.id === player.id ? 'current-player' : ''}`}
              >
                <div className="player-info">
                  <span className="player-name">{p.name}</span>
                  <div className="player-stats">
                    <span className="player-score">Score: {p.score || 0}</span>
                    <span className={`status-dot ${p.ready ? 'ready' : 'not-ready'}`}>
                      {p.ready ? '●' : '○'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isHost && (
          !player.ready ? (
            <div className="button-group">
              <button 
                onClick={onMarkReady}
                className="action-button host-button"
              >
                <span className="button-icon">✓</span>
                Mark as Ready
                <span className="button-description">Let others know you're ready to play</span>
              </button>
              <button 
                onClick={onLeaveGame}
                className="action-button leave-game-button"
              >
                <span className="button-icon">🚪</span>
                Leave Game
                <span className="button-description">Exit this game session</span>
              </button>
            </div>
          ) : (
            <div className="status-card">
              <span className="status-icon">⌛</span>
              <p className="status-message">
                Ready! Waiting for other players and host to start the game...
              </p>
              <button 
                onClick={onLeaveGame}
                className="action-button leave-game-button"
              >
                <span className="button-icon">🚪</span>
                Leave Game
                <span className="button-description">Exit this game session</span>
              </button>
            </div>
          )
        )}

        <div className="loading-animation">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  );
}

export default WaitingRoom; 