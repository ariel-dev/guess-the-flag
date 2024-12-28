import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_GAME_SESSION, GET_GAME_SESSION, START_GAME, CANCEL_GAME_SESSION, REMOVE_PLAYER } from '../graphql/queries';
import GamePage from './GamePage';
import { ActionCableConsumer } from 'react-actioncable-provider';

function HostView({ isHost = true, onBack }) {
  const [sessionCode, setSessionCode] = useState(() => {
    return localStorage.getItem('hostSessionCode');
  });
  const [maxQuestions, setMaxQuestions] = useState(10);
  const [wsConnected, setWsConnected] = useState(false);

  const handleReceived = (data) => {
    // Refetch game session data when we receive a WebSocket message
    // This ensures our UI stays in sync with the server state
    refetch();
  };

  const {
    data: sessionData,
    loading: sessionLoading,
    error: sessionError,
    refetch,
  } = useQuery(GET_GAME_SESSION, {
    variables: { sessionCode },
    skip: !sessionCode,
  });

  const [createSession, { loading: creatingSession, error: creationError }] = useMutation(
    CREATE_GAME_SESSION,
    {
      onCompleted: (data) => {
        const code = data.createGameSession.gameSession.sessionCode;
        setSessionCode(code);
        localStorage.setItem('hostSessionCode', code);
      },
    }
  );

  const [cancelGame] = useMutation(CANCEL_GAME_SESSION, {
    variables: { sessionCode },
    onCompleted: () => {
      setSessionCode(null);
      localStorage.removeItem('hostSessionCode');
    },
  });

  const [startGame, { loading: startingGame, error: startError }] = useMutation(
    START_GAME,
    {
      variables: { sessionCode, maxQuestions },
      onCompleted: (data) => {
        if (data.startGame.errors?.length > 0) {
          console.error('Failed to start game:', data.startGame.errors);
        } else {
          refetch();
        }
      },
    }
  );

  const [removePlayer] = useMutation(REMOVE_PLAYER, {
    onCompleted: () => {
      refetch();
    },
  });

  const allPlayersReady = sessionData?.gameSession?.players?.length > 0 && 
    sessionData.gameSession.players.every(player => player.ready);
  const gameInProgress = sessionData?.gameSession?.active && 
    sessionData?.gameSession?.currentQuestion !== null;

  if (!sessionCode) {
    return (
      <div className="game-container">
        <button 
          className="back-button"
          onClick={onBack}
        >
          <span className="button-icon">←</span>
          Back to Menu
        </button>
        <div className="card action-card">
          <h1 className="title">Host a New Game</h1>
          <p className="subtitle">Create a new game session and invite players to join!</p>
          <button 
            onClick={() => createSession()} 
            disabled={creatingSession}
            className="action-button host-button"
          >
            <span className="button-icon">🎮</span>
            {creatingSession ? 'Creating Session...' : 'Create New Session'}
            <span className="button-description">Start hosting a new game</span>
          </button>
          {creationError && (
            <p className="error">Error creating session: {creationError.message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <ActionCableConsumer
        channel={{ channel: 'GameChannel', session_code: sessionCode }}
        onConnected={() => setWsConnected(true)}
        onDisconnected={() => setWsConnected(false)}
        onReceived={handleReceived}
      />
      <button 
        className="back-button"
        onClick={onBack}
      >
        <span className="button-icon">←</span>
        Back to Menu
      </button>

      <div className="host-layout">
        <div className="host-sidebar">
          <div className="card action-card">
            <h2 className="title">Host</h2>
            <div className="session-info">
              <p className="subtitle">Game Code: <strong>{sessionCode}</strong></p>
              <button 
                onClick={() => navigator.clipboard.writeText(sessionCode)}
                className="copy-button"
              >
                <span className="button-icon">📋</span>
                Copy Code
              </button>
            </div>

            {!gameInProgress && (
              <div className="game-settings">
                <h3>Game Settings</h3>
                <div className="setting-item">
                  <label htmlFor="maxQuestions">Number of Questions:</label>
                  <input
                    id="maxQuestions"
                    type="number"
                    min="1"
                    max="20"
                    value={maxQuestions}
                    onChange={(e) => setMaxQuestions(Math.max(1, Math.min(20, parseInt(e.target.value) || 10)))}
                    disabled={gameInProgress}
                  />
                </div>
              </div>
            )}

            {sessionData?.gameSession?.players && (
              <div className="players-list">
                <h3>Players ({sessionData.gameSession.players.length})</h3>
                {sessionData.gameSession.players.map((player) => (
                  <div key={player.id} className="player-item">
                    <div className="player-info">
                      <span className="player-name">{player.name}</span>
                      <div className="player-stats">
                        <span className="player-score">Score: {player.score || 0}</span>
                        <span className={`status-dot ${player.ready ? 'ready' : 'not-ready'}`}>
                          {player.ready ? '●' : '○'}
                        </span>
                      </div>
                    </div>
                    {isHost && (
                      <button 
                        onClick={() => removePlayer({
                          variables: {
                            playerId: player.id,
                            sessionCode
                          }
                        })}
                        className="remove-player-button"
                        title="Remove player"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="session-actions">
              {!gameInProgress && (
                <>
                  <button 
                    onClick={() => startGame()} 
                    disabled={startingGame || !allPlayersReady || !sessionData?.gameSession?.players?.length}
                    className="start-button"
                  >
                    <span className="button-icon">▶️</span>
                    {startingGame ? 'Starting...' : 
                     !sessionData?.gameSession?.players?.length ? 'Waiting for players...' :
                     !allPlayersReady ? 'Waiting for players to be ready...' : 
                     'Start Game'}
                  </button>
                  <button 
                    onClick={() => cancelGame()}
                    className="cancel-button"
                  >
                    <span className="button-icon">❌</span>
                    Cancel Game
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="game-content">
          {true && (
            <GamePage 
              sessionCode={sessionCode} 
              player={{ 
                id: 'host',
                name: 'Host',
                isHost: true
              }} 
            />
          )}
        </div>
      </div>

      {startError && (
        <p className="error">Error starting game: {startError.message}</p>
      )}

      {wsConnected && (
        <div className="connection-status connected">
          <span className="status-dot">🟢</span>
          Connected
        </div>
      )}
    </div>
  );
}

export default HostView; 