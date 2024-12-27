import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { JOIN_GAME_SESSION, MARK_PLAYER_READY, GET_GAME_SESSION } from '../queriesAndMutations';
import { ActionCableConsumer } from 'react-actioncable-provider';
import GamePage from './GamePage';

export default function PlayerView() {
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [player, setPlayer] = useState<any>(null); // store the joined player info
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Add query to check game status
  const { data: sessionData, refetch } = useQuery(GET_GAME_SESSION, {
    variables: { sessionCode },
    skip: !player,
    pollInterval: 5000, // Optional: poll every 5 seconds
  });

  // Add ActionCable handler
  const handleReceived = (response: any) => {
    const { event, data } = response;
    console.log('Received event:', event, data); // Enhanced logging
    if (event === 'game_started') {
      console.log('Game started event received');
      setGameStarted(true);
      refetch(); // Refetch to get the latest game state
    } else if (event === 'player_ready_toggled') {
      refetch();
    }
  };

  // 1. Join Game Session mutation
  const [joinGameSession, { loading: joining, error: joinError }] = useMutation(
    JOIN_GAME_SESSION,
    {
      onCompleted: (data) => {
        // store the returned player object
        if (data?.joinGameSession?.player) {
          setPlayer(data.joinGameSession.player);
          setErrorMessage(null);
          // Refetch session data after joining
          refetch();
        }
      },
      onError: (error) => {
        setErrorMessage(error.message);
      },
    }
  );

  // 2. Mark Player Ready mutation
  const [markPlayerReady, { loading: togglingReady, error: readyError }] =
    useMutation(MARK_PLAYER_READY, {
      onCompleted: (data) => {
        // update the local player state with new "ready" status
        if (data?.markPlayerReady?.player) {
          setPlayer(data.markPlayerReady.player);
          refetch(); // Refetch session data to update player list
        }
      },
    });

  const handleJoin = () => {
    if (!sessionCode.trim() || !playerName.trim()) {
      setErrorMessage('Both session code and player name are required.');
      return;
    }

    joinGameSession({
      variables: {
        sessionCode: sessionCode.trim().toUpperCase(),
        playerName: playerName.trim()
      },
      onCompleted: (data) => {
        if (data?.joinGameSession?.player) {
          setPlayer(data.joinGameSession.player);
          setErrorMessage(null);
          // Refetch session data after joining
          refetch();
        } else {
          setErrorMessage('Failed to join game session.');
        }
      },
      onError: (error) => {
        setErrorMessage(error.message);
      }
    });
  };

  const handleToggleReady = () => {
    if (!player) return;
    markPlayerReady({
      variables: {
        playerId: player.id,
      },
      onError: (error) => {
        setErrorMessage(error.message);
      },
    });
  };

  // Only show GamePage when game has explicitly started
  if (gameStarted && player) {
    return <GamePage sessionCode={sessionCode} playerId={player.id} />;
  }

  // Show waiting room if player has joined (regardless of session active state)
  if (player) {
    return (
      <div className="card">
        <h2 className="text-center mb-4">Waiting Room</h2>
        <div className="mb-4">
          <p>Session Code: <strong>{sessionCode}</strong></p>
          <p>Player Name: <strong>{player.name}</strong></p>
          <div className={`status-badge ${player.ready ? 'ready' : 'not-ready'}`}>
            {player.ready ? '✓ Ready' : '⌛ Not Ready'}
          </div>
        </div>

        <button 
          onClick={handleToggleReady} 
          disabled={togglingReady}
          className={`ready-button ${player.ready ? 'ready' : ''}`}
        >
          {togglingReady ? 'Updating...' : player.ready ? 'Mark as Not Ready' : 'Mark as Ready'}
        </button>

        {readyError && (
          <p className="error">Error toggling ready: {readyError.message}</p>
        )}

        {sessionData?.gameSession?.players && (
          <div className="players-list card mt-4">
            <h3 className="mb-4">Players in Room:</h3>
            {sessionData.gameSession.players.map((p: any) => (
              <div key={p.id} className="player-item">
                <span>{p.name}</span>
                <span className={`status-dot ${p.ready ? 'ready' : 'not-ready'}`}>
                  {p.ready ? '●' : '○'}
                </span>
              </div>
            ))}
          </div>
        )}
        
        <ActionCableConsumer
          channel={{ channel: 'GameSessionChannel', session_code: sessionCode }}
          onReceived={handleReceived}
          onConnected={() => console.log('Connected to GameSessionChannel')}
          onRejected={() => console.log('Rejected from GameSessionChannel')}
        />
      </div>
    );
  }

  // Not yet joined => show form
  return (
    <div className="card">
      <h2 className="text-center mb-4">Join Game</h2>
      <div className="form-group mb-4">
        <label htmlFor="sessionCode">Session Code:</label>
        <input
          id="sessionCode"
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
          placeholder="Enter session code"
          className="form-input"
        />
      </div>
      <div className="form-group mb-4">
        <label htmlFor="playerName">Player Name:</label>
        <input
          id="playerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="form-input"
        />
      </div>
      <button 
        onClick={handleJoin} 
        disabled={joining || !sessionCode.trim() || !playerName.trim()}
        className="primary-button"
      >
        {joining ? 'Joining...' : 'Join Game'}
      </button>

      {errorMessage && <p className="error">{errorMessage}</p>}
      {joinError && (
        <p className="error">Error joining session: {joinError.message}</p>
      )}
    </div>
  );
}