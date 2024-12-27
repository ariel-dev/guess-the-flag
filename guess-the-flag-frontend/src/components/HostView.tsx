import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_GAME_SESSION, GET_GAME_SESSION, START_GAME } from '../queriesAndMutations';

export default function HostView() {
  const [sessionCode, setSessionCode] = useState<string | null>(null);

  // 1. Create session mutation
  const [createSession, { loading: creatingSession, error: creationError }] =
    useMutation(CREATE_GAME_SESSION, {
      onCompleted: (data) => {
        // When the mutation completes, store the session code
        const code = data.createGameSession.gameSession.sessionCode;
        setSessionCode(code);
      },
    });

  // 2. Query for existing session if we have a sessionCode
  const {
    data: sessionData,
    loading: sessionLoading,
    error: sessionError,
    refetch,
  } = useQuery(GET_GAME_SESSION, {
    variables: { sessionCode: sessionCode },
    skip: !sessionCode, // Don't run query if sessionCode is null
  });

  const handleCreateSession = () => {
    createSession();
  };

  // 3. Start game mutation
  const [startGame, { loading: startingGame, error: startError }] = useMutation(START_GAME, {
    variables: { sessionCode },
    onCompleted: (data) => {
      if (data.startGame.errors?.length > 0) {
        // Handle any errors returned from the mutation
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

  const handleStartGame = () => {
    if (!sessionCode) return;
    startGame();
  };

  // Check if all players are ready
  const allPlayersReady = sessionData?.gameSession?.players?.length > 0 && 
    sessionData.gameSession.players.every((player: any) => player.ready);

  return (
    <div className="card">
      <h2 className="text-center mb-4">Host View</h2>

      {sessionCode ? (
        <div>
          <div className="session-info mb-4">
            <p>Session Code: <strong>{sessionCode}</strong></p>
            <button 
              onClick={() => navigator.clipboard.writeText(sessionCode)}
              className="copy-button"
            >
              📋 Copy Code
            </button>
          </div>

          {sessionData?.gameSession?.players && (
            <div className="players-list card">
              <h3>Players ({sessionData.gameSession.players.length})</h3>
              {sessionData.gameSession.players.map((player: any) => (
                <div key={player.id} className="player-item">
                  <span>{player.name}</span>
                  <span className={`status-dot ${player.ready ? 'ready' : 'not-ready'}`}>
                    {player.ready ? '●' : '○'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button 
            onClick={handleStartGame} 
            disabled={startingGame || !allPlayersReady || sessionData?.gameSession?.players?.length === 0}
            className="mt-4"
          >
            {startingGame ? 'Starting...' : 
             sessionData?.gameSession?.players?.length === 0 ? 'Waiting for players...' :
             !allPlayersReady ? 'Waiting for players to be ready...' : 
             'Start Game'}
          </button>
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