import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_GAME_SESSION, GET_GAME_SESSION, START_GAME, CANCEL_GAME_SESSION, REMOVE_PLAYER } from '../queriesAndMutations';

export default function HostView() {
  const [sessionCode, setSessionCode] = useState<string | null>(() => {
    // Check localStorage for previous host session
    return localStorage.getItem('hostSessionCode');
  });
  const [maxQuestions, setMaxQuestions] = useState<number>(10);

  // Query for existing session if we have a sessionCode
  const {
    data: sessionData,
    loading: sessionLoading,
    error: sessionError,
    refetch,
  } = useQuery(GET_GAME_SESSION, {
    variables: { sessionCode: sessionCode },
    skip: !sessionCode,
  });

  // Create session mutation
  const [createSession, { loading: creatingSession, error: creationError }] =
    useMutation(CREATE_GAME_SESSION, {
      onCompleted: (data) => {
        const code = data.createGameSession.gameSession.sessionCode;
        setSessionCode(code);
        // Save session code to localStorage
        localStorage.setItem('hostSessionCode', code);
      },
    });

  // Cancel game mutation
  const [cancelGame] = useMutation(CANCEL_GAME_SESSION, {
    variables: { sessionCode },
    onCompleted: () => {
      // Clear session data
      setSessionCode(null);
      localStorage.removeItem('hostSessionCode');
    },
    onError: (error) => {
      console.error('Error cancelling game:', error);
    }
  });

  // Start game mutation
  const [startGame, { loading: startingGame, error: startError }] = useMutation(START_GAME, {
    variables: { sessionCode, maxQuestions },
    onCompleted: (data) => {
      if (data.startGame.errors?.length > 0) {
        console.error('Failed to start game:', data.startGame.errors);
      } else {
        console.log('Game started:', data.startGame.gameSession);
        refetch();
      }
    },
    onError: (error) => {
      console.error('Error starting game:', error);
    }
  });

  const [removePlayer] = useMutation(REMOVE_PLAYER, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Error removing player:', error);
    }
  });

  const handleCreateSession = () => {
    createSession();
  };

  const handleStartGame = () => {
    if (!sessionCode) return;
    startGame();
  };

  const handleCancelGame = () => {
    if (!sessionCode) return;
    if (window.confirm('Are you sure you want to cancel this game? All players will be removed.')) {
      cancelGame();
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    if (!sessionCode) return;
    
    if (window.confirm('Are you sure you want to remove this player?')) {
      removePlayer({
        variables: {
          playerId,
          sessionCode
        }
      });
    }
  };

  // Check if all players are ready
  const allPlayersReady = sessionData?.gameSession?.players?.length > 0 && 
    sessionData.gameSession.players.every((player: any) => player.ready);

  // Add state to track if game is in progress
  const gameInProgress = sessionData?.gameSession?.active && 
    sessionData?.gameSession?.currentQuestion !== null;

  // Update the button rendering
  const renderActionButton = () => {
    if (gameInProgress) {
      return (
        <button 
          onClick={handleCancelGame}
          className="mt-4 cancel-button"
        >
          End Game
        </button>
      );
    }

    return (
      <button 
        onClick={handleStartGame} 
        disabled={startingGame || !allPlayersReady || sessionData?.gameSession?.players?.length === 0}
        className="mt-4 start-button"
      >
        {startingGame ? 'Starting...' : 
         sessionData?.gameSession?.players?.length === 0 ? 'Waiting for players...' :
         !allPlayersReady ? 'Waiting for players to be ready...' : 
         'Start Game'}
      </button>
    );
  };

  return (
    <div className="card">
      <h2 className="text-center mb-4">Host View</h2>

      {sessionCode ? (
        <div>
          <div className="session-info mb-4">
            <p>Session Code: <strong>{sessionCode}</strong></p>
            <div className="session-actions">
              <button 
                onClick={() => navigator.clipboard.writeText(sessionCode)}
                className="copy-button"
              >
                📋 Copy Code
              </button>
              {!gameInProgress && (
                <>
                  <div className="game-settings mb-4">
                    <label htmlFor="maxQuestions">Number of Questions:</label>
                    <input
                      id="maxQuestions"
                      type="number"
                      min="1"
                      max="20"
                      value={maxQuestions}
                      onChange={(e) => setMaxQuestions(Math.max(1, Math.min(20, parseInt(e.target.value) || 10)))}
                      disabled={gameInProgress}
                      className="form-input"
                    />
                  </div>
                  <button 
                    onClick={handleCancelGame}
                    className="cancel-button"
                  >
                    ❌ Cancel Game
                  </button>
                </>
              )}
            </div>
          </div>

          {sessionData?.gameSession?.players && (
            <div className="players-list card">
              <h3>Players ({sessionData.gameSession.players.length})</h3>
              {sessionData.gameSession.players.map((player: any) => (
                <div key={player.id} className="player-item">
                  <div className="player-info">
                    <span className="player-name">{player.name}</span>
                    <span className={`status-dot ${player.ready ? 'ready' : 'not-ready'}`}>
                      {player.ready ? '●' : '○'}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemovePlayer(player.id)}
                    className="remove-player-button"
                    title="Remove player"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {renderActionButton()}
        </div>
      ) : (
        <button onClick={handleCreateSession} disabled={creatingSession}>
          {creatingSession ? 'Creating...' : 'Create Session'}
        </button>
      )}

      {/* Error handling */}
      {creationError && (
        <p className="error">Error creating session: {creationError.message}</p>
      )}
      {startError && (
        <p className="error">Error starting game: {startError.message}</p>
      )}
    </div>
  );
}