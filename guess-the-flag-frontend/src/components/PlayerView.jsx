import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { JOIN_GAME_SESSION, MARK_PLAYER_READY, GET_GAME_SESSION } from '../graphql/queries';
import { ActionCableConsumer } from 'react-actioncable-provider';
import GamePage from './GamePage';

function PlayerView() {
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [player, setPlayer] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  // Add state for previous session
  const [previousSession, setPreviousSession] = useState(() => {
    const saved = localStorage.getItem('previousSession');
    return saved ? JSON.parse(saved) : null;
  });

  // Save session data when joining successfully
  const saveSessionData = (sessionCode, player) => {
    const sessionData = {
      sessionCode,
      playerId: player.id,
      playerName: player.name
    };
    localStorage.setItem('previousSession', JSON.stringify(sessionData));
    setPreviousSession(sessionData);
  };

  // Query for existing session
  const { data: sessionData, refetch } = useQuery(GET_GAME_SESSION, {
    variables: { sessionCode },
    skip: !sessionCode || !player,
  });

  const [joinGame, { loading: joining, error: joinError }] = useMutation(JOIN_GAME_SESSION, {
    onCompleted: (data) => {
      const joinedPlayer = data.joinGameSession.player;
      setPlayer(joinedPlayer);
      saveSessionData(sessionCode, joinedPlayer);
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const [markReady] = useMutation(MARK_PLAYER_READY, {
    onCompleted: (data) => {
      setPlayer(prev => ({ ...prev, ready: data.markPlayerReady.player.ready }));
    },
  });

  const handleJoin = () => {
    if (!sessionCode.trim() || !playerName.trim()) return;
    
    joinGame({
      variables: {
        sessionCode: sessionCode.trim(),
        playerName: playerName.trim(),
      },
    });
  };

  const handleRejoin = () => {
    if (!previousSession) return;
    
    joinGame({
      variables: {
        sessionCode: previousSession.sessionCode,
        playerName: previousSession.playerName,
        existingPlayerId: previousSession.playerId,
      },
    });
  };

  const handleReceived = (data) => {
    if (data.event === 'game_started') {
      setGameStarted(true);
    }
    refetch();
  };

  if (gameStarted && player) {
    return <GamePage sessionCode={sessionCode} player={player} />;
  }

  if (player) {
    return (
      <div className="card">
        <ActionCableConsumer
          channel={{ channel: 'GameSessionChannel', session_code: sessionCode }}
          onConnected={() => setWsConnected(true)}
          onDisconnected={() => setWsConnected(false)}
          onReceived={handleReceived}
        />
        <h2>Waiting Room</h2>
        <p>Connected to game: {sessionCode}</p>
        <p>Your name: {player.name}</p>
        <p>WebSocket Status: {wsConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
        
        {!player.ready && (
          <button 
            onClick={() => markReady({ variables: { playerId: player.id } })}
            className="ready-button"
          >
            Mark as Ready
          </button>
        )}
        
        {player.ready && (
          <p className="status-message">
            Waiting for other players and host to start the game...
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-center mb-4">Join Game</h2>
      
      {previousSession && (
        <div className="previous-session card mb-4">
          <h3>Previous Game Session</h3>
          <p>Session: <strong>{previousSession.sessionCode}</strong></p>
          <p>Name: <strong>{previousSession.playerName}</strong></p>
          <button 
            onClick={handleRejoin}
            className="rejoin-button"
          >
            Rejoin Game
          </button>
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

export default PlayerView; 