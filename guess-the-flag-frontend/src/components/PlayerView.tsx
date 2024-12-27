import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { JOIN_GAME_SESSION, MARK_PLAYER_READY, GET_GAME_SESSION } from '../queriesAndMutations';
import { ActionCableConsumer } from 'react-actioncable-provider';
import GamePage from './GamePage';
import { gql } from '@apollo/client';

// Add a query to check if game session exists and is valid
const CHECK_GAME_SESSION = gql`
  query CheckGameSession($sessionCode: String!) {
    gameSession(sessionCode: $sessionCode) {
      id
      active
    }
  }
`;

export default function PlayerView() {
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [player, setPlayer] = useState<any>(null); // store the joined player info
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  // Add state for previous session
  const [previousSession, setPreviousSession] = useState(() => {
    // Check localStorage for previous session data
    const saved = localStorage.getItem('previousSession');
    return saved ? JSON.parse(saved) : null;
  });

  // Save session data when joining successfully
  const saveSessionData = (sessionCode: string, player: any) => {
    const sessionData = {
      sessionCode,
      playerId: player.id,
      playerName: player.name
    };
    localStorage.setItem('previousSession', JSON.stringify(sessionData));
    setPreviousSession(sessionData);
  };

  // Add query to check if previous session is still valid
  const { data: previousSessionData, loading: checkingSession } = useQuery(CHECK_GAME_SESSION, {
    variables: { sessionCode: previousSession?.sessionCode || '' },
    skip: !previousSession,
    onCompleted: (data) => {
      if (!data?.gameSession) {
        // Session no longer exists, clear it
        localStorage.removeItem('previousSession');
        setPreviousSession(null);
      }
    }
  });

  // Add query to check game status
  const { data: sessionData, refetch } = useQuery(GET_GAME_SESSION, {
    variables: { sessionCode },
    skip: !player,
    pollInterval: 5000, // Optional: poll every 5 seconds
    onCompleted: (data) => {
      // If there's a current question and we're rejoining, set game as started
      if (data?.gameSession?.currentQuestion && player) {
        setGameStarted(true);
      }
    }
  });

  // Handle joining existing session
  const handleRejoin = () => {
    if (!previousSession || !previousSessionData?.gameSession?.active) {
      setErrorMessage('This game session is no longer available.');
      localStorage.removeItem('previousSession');
      setPreviousSession(null);
      return;
    }
    
    joinGameSession({
      variables: {
        sessionCode: previousSession.sessionCode,
        playerName: previousSession.playerName,
        existingPlayerId: previousSession.playerId
      },
      onCompleted: async (data) => {
        if (data?.joinGameSession?.player) {
          setPlayer(data.joinGameSession.player);
          setSessionCode(previousSession.sessionCode);
          setErrorMessage(null);
          
          // Fetch current game session state
          const { data: currentSession } = await refetch();
          // If there's a current question, set game as started immediately
          if (currentSession?.gameSession?.currentQuestion) {
            setGameStarted(true);
          }
        } else {
          setErrorMessage('Failed to rejoin game session.');
          localStorage.removeItem('previousSession');
          setPreviousSession(null);
        }
      },
      onError: (error) => {
        setErrorMessage(error.message);
        localStorage.removeItem('previousSession');
        setPreviousSession(null);
      }
    });
  };

  // Add ActionCable handler
  const handleReceived = (response: any) => {
    const { event, data } = response;
    console.log('Received event:', event, data);
    
    if (event === 'player_removed' && data.player_id === player?.id) {
      // We've been removed from the game
      setPlayer(null);
      setGameStarted(false);
      localStorage.removeItem('previousSession');
      setPreviousSession(null);
      setErrorMessage('You have been removed from the game by the host');
    } else if (event === 'game_started') {
      setGameStarted(true);
      refetch();
    } else if (event === 'player_ready_toggled') {
      refetch();
    } else if (event === 'game_cancelled') {
      // Clear player state and session data
      setPlayer(null);
      setGameStarted(false);
      localStorage.removeItem('previousSession');
      setPreviousSession(null);
      setErrorMessage('Game has been cancelled by the host');
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
        playerName: playerName.trim(),
        existingPlayerId: null
      },
      onCompleted: (data) => {
        if (data?.joinGameSession?.player) {
          setPlayer(data.joinGameSession.player);
          setErrorMessage(null);
          saveSessionData(sessionCode, data.joinGameSession.player);
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

  // Update the ActionCable handlers
  const handleConnected = () => {
    console.log('Connected to GameSessionChannel');
    setWsConnected(true);
    // Refetch session data when connection is established
    if (player) {
      refetch();
    }
  };

  const handleDisconnected = () => {
    console.log('Disconnected from GameSessionChannel');
    setWsConnected(false);
  };

  const handleRejected = () => {
    console.log('Connection rejected');
    setWsConnected(false);
    setErrorMessage('Connection to game server failed. Please try rejoining.');
  };

  // Add reconnection effect
  useEffect(() => {
    if (!wsConnected && player) {
      // Try to reconnect after a brief delay
      const timeout = setTimeout(() => {
        console.log('Attempting to reconnect...');
        refetch();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [wsConnected, player]);

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
          onConnected={handleConnected}
          onDisconnected={handleDisconnected}
          onRejected={handleRejected}
        />

        {!wsConnected && (
          <div className="connection-warning">
            Reconnecting to game server...
          </div>
        )}
      </div>
    );
  }

  // Not yet joined => show form
  return (
    <div className="card">
      <h2 className="text-center mb-4">Join Game</h2>
      
      {previousSession && (
        <div className="previous-session card mb-4">
          <h3>Previous Game Session</h3>
          <p>Session: <strong>{previousSession.sessionCode}</strong></p>
          <p>Name: <strong>{previousSession.playerName}</strong></p>
          {checkingSession ? (
            <p className="status-message">Checking session status...</p>
          ) : previousSessionData?.gameSession?.active ? (
            <button 
              onClick={handleRejoin}
              className="rejoin-button"
            >
              Rejoin Game
            </button>
          ) : (
            <p className="status-message error">This game session is no longer available</p>
          )}
        </div>
      )}

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