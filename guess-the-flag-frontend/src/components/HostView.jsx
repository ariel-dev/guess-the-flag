import React, { useState, useEffect } from 'react';
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
  const [hostPlayer, setHostPlayer] = useState(null);

  const handleReceived = (data) => {
    console.log('Received WebSocket message:', data);
    switch (data.event) {
      case 'player_joined':
        // Update the session data to reflect the new player
        refetch();
        break;
      case 'game_cancelled':
        // Update to the new session code and refetch game state
        if (data.data.newSessionCode) {
          setSessionCode(data.data.newSessionCode);
          localStorage.setItem('hostSessionCode', data.data.newSessionCode);
          refetch();
        }
        break;
      default:
        refetch();
        break;
    }
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

  // Update hostPlayer when session data changes
  useEffect(() => {
    if (sessionData?.gameSession?.players) {
      const host = sessionData.gameSession.players.find(player => player.isHost);
      if (host) {
        setHostPlayer(host);
      }
    }
  }, [sessionData]);

  const [createSession, { loading: creatingSession, error: creationError }] = useMutation(
    CREATE_GAME_SESSION,
    {
      variables: { hostName: 'Host' },
      onCompleted: (data) => {
        const code = data.createGameSession.gameSession.sessionCode;
        setSessionCode(code);
        setHostPlayer(data.createGameSession.hostPlayer);
        localStorage.setItem('hostSessionCode', code);
      },
    }
  );

  const [cancelGame] = useMutation(CANCEL_GAME_SESSION, {
    variables: { sessionCode },
    onCompleted: (data) => {
      if (data.cancelGameSession.success) {
        localStorage.removeItem('hostSessionCode');
        onBack();
      }
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

  const handleCancelGame = () => {
    cancelGame({
      variables: { sessionCode },
      onCompleted: (data) => {
        if (data.cancelGameSession.success) {
          localStorage.removeItem('hostSessionCode');
          onBack();
        } else {
          // If game session not found, clean up local state
          if (data.cancelGameSession.errors.includes("Game session not found")) {
            localStorage.removeItem('hostSessionCode');
            onBack();
          } else {
            console.error('Failed to cancel game:', data.cancelGameSession.errors);
          }
        }
      },
      onError: (error) => {
        // If there's a network error or other issue, clean up local state
        console.error('Error canceling game:', error);
        localStorage.removeItem('hostSessionCode');
        onBack();
      }
    });
  };

  const handleBack = () => {
    onBack();
  };

  if (!sessionCode) {
    return (
      <div className="game-container">
        <button 
          className="back-button"
          onClick={handleBack}
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
        channel={{ channel: 'GameSessionChannel', session_code: sessionCode }}
        onConnected={() => setWsConnected(true)}
        onDisconnected={() => setWsConnected(false)}
        onReceived={handleReceived}
      />
      <button 
        className="back-button"
        onClick={handleBack}
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
                    {isHost && !gameInProgress && (
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
              {gameInProgress ? (
                <button 
                  onClick={handleCancelGame}
                  className="cancel-button"
                >
                  <span className="button-icon">❌</span>
                  Cancel Game
                </button>
              ) : (
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
                    onClick={handleCancelGame}
                    className="cancel-button"
                  >
                    <span className="button-icon">❌</span>
                    Cancel Session
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="game-content">
          {hostPlayer && (
            <GamePage 
              sessionCode={sessionCode} 
              player={hostPlayer}
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