import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_GAME_SESSION, GET_GAME_SESSION, START_GAME, CANCEL_GAME_SESSION, REMOVE_PLAYER } from '../queriesAndMutations';

export default function HostView({ isHost = true }) {
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

  // Only initialize mutations if user is the host
  const [createSession, { loading: creatingSession, error: creationError }] = isHost ?
    useMutation(CREATE_GAME_SESSION, {
      onCompleted: (data) => {
        const code = data.createGameSession.gameSession.sessionCode;
        setSessionCode(code);
        localStorage.setItem('hostSessionCode', code);
      },
    }) : [() => {}, { loading: false, error: null }];

  const [cancelGame] = isHost ? useMutation(CANCEL_GAME_SESSION, {
    variables: { sessionCode },
    onCompleted: () => {
      setSessionCode(null);
      localStorage.removeItem('hostSessionCode');
    },
  }) : [() => {}];

  const [startGame, { loading: startingGame, error: startError }] = isHost ? 
    useMutation(START_GAME, {
      variables: { sessionCode, maxQuestions },
      onCompleted: (data) => {
        if (data.startGame.errors?.length > 0) {
          console.error('Failed to start game:', data.startGame.errors);
        } else {
          refetch();
        }
      },
    }) : [() => {}, { loading: false, error: null }];

  const [removePlayer] = isHost ? useMutation(REMOVE_PLAYER, {
    onCompleted: () => {
      refetch();
    },
  }) : [() => {}];

  // Game state checks
  const allPlayersReady = sessionData?.gameSession?.players?.length > 0 && 
    sessionData.gameSession.players.every((player: any) => player.ready);
  const gameInProgress = sessionData?.gameSession?.active && 
    sessionData?.gameSession?.currentQuestion !== null;

  return (
    <div className="card">
      <h2 className="text-center mb-4">{isHost ? 'Host View' : 'Lobby'}</h2>

      {sessionCode ? (
        <div>
          {isHost && (
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
                      onClick={() => cancelGame()}
                      className="cancel-button"
                    >
                      ❌ Cancel Game
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

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

          {isHost && !gameInProgress && (
            <button 
              onClick={() => startGame && startGame()} 
              disabled={startingGame || !allPlayersReady || sessionData?.gameSession?.players?.length === 0}
              className="mt-4 start-button"
            >
              {startingGame ? 'Starting...' : 
               sessionData?.gameSession?.players?.length === 0 ? 'Waiting for players...' :
               !allPlayersReady ? 'Waiting for players to be ready...' : 
               'Start Game'}
            </button>
          )}
        </div>
      ) : isHost ? (
        <button onClick={() => createSession && createSession()} disabled={creatingSession}>
          {creatingSession ? 'Creating...' : 'Create Session'}
        </button>
      ) : null}

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