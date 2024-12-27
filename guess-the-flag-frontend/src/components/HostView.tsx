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
      console.log('Game started:', data.startGame.gameSession);
    },
  });

  const handleStartGame = () => {
    startGame();
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h2>Host View</h2>

      {sessionCode ? (
        <p>
          Session Code: <strong>{sessionCode}</strong>
        </p>
      ) : (
        <button onClick={handleCreateSession} disabled={creatingSession}>
          {creatingSession ? 'Creating...' : 'Create Session'}
        </button>
      )}

      {/* Show any creation error */}
      {creationError && (
        <p style={{ color: 'red' }}>Error creating session: {creationError.message}</p>
      )}

      {/* Once we have a session code, load session details */}
      {sessionCode && (
        <div style={{ marginTop: '1rem' }}>
          {sessionLoading && <p>Loading session details...</p>}
          {sessionError && (
            <p style={{ color: 'red' }}>
              Error loading session: {sessionError.message}
            </p>
          )}
          {sessionData?.gameSession && (
            <>
              <h3>Connected Players</h3>
              {sessionData.gameSession.players.length === 0 ? (
                <p>No players yet.</p>
              ) : (
                <ul>
                  {sessionData.gameSession.players.map((player: any) => (
                    <li key={player.id}>
                      {player.name} - Ready? {player.ready ? 'Yes' : 'No'}
                    </li>
                  ))}
                </ul>
              )}
              <button onClick={() => refetch()}>Refresh Player List</button>
              <button onClick={handleStartGame} disabled={startingGame}>
                {startingGame ? 'Starting Game...' : 'Start Game'}
              </button>
              {startError && (
                <p style={{ color: 'red' }}>Error starting game: {startError.message}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}