import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { JOIN_GAME_SESSION, MARK_PLAYER_READY, GET_GAME_SESSION } from '../graphql/queries';
import { ActionCableConsumer } from 'react-actioncable-provider';
import GamePage from './GamePage';

function PlayerView({ onBack }) {
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [player, setPlayer] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const [previousSession, setPreviousSession] = useState(() => {
    const saved = localStorage.getItem('previousSession');
    return saved ? JSON.parse(saved) : null;
  });

  const saveSessionData = (sessionCode, player) => {
    const sessionData = {
      sessionCode,
      playerId: player.id,
      playerName: player.name
    };
    localStorage.setItem('previousSession', JSON.stringify(sessionData));
    setPreviousSession(sessionData);
  };

  const { data: sessionData, refetch } = useQuery(GET_GAME_SESSION, {
    variables: { sessionCode },
    skip: !sessionCode || !player,
  });

  const [joinGame, { loading: joining }] = useMutation(JOIN_GAME_SESSION, {
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
      <div className="game-container">
        <button 
          className="back-button"
          onClick={onBack}
        >
          <span className="button-icon">←</span>
          Back to Menu
        </button>
        <ActionCableConsumer
          channel={{ channel: 'GameChannel', session_code: sessionCode }}
          onConnected={() => setWsConnected(true)}
          onDisconnected={() => setWsConnected(false)}
          onReceived={handleReceived}
        />
        <div className="card action-card">
          <h2 className="title">Waiting Room</h2>
          <div className="session-info">
            <p className="subtitle">Game Code: <strong>{sessionCode}</strong></p>
            <p className="subtitle">Player: <strong>{player.name}</strong></p>
            <div className={`connection-status ${wsConnected ? 'connected' : 'disconnected'}`}>
              <span className="status-dot">{wsConnected ? '🟢' : '🔴'}</span>
              {wsConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          
          {!player.ready ? (
            <button 
              onClick={() => markReady({ variables: { playerId: player.id } })}
              className="action-button host-button"
            >
              <span className="button-icon">✓</span>
              Mark as Ready
              <span className="button-description">Let others know you're ready to play</span>
            </button>
          ) : (
            <div className="status-card">
              <span className="status-icon">⌛</span>
              <p className="status-message">
                Ready! Waiting for other players and host to start the game...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

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
        <h2 className="title">Join Game</h2>
        <p className="subtitle">Enter a session code to join an existing game</p>
        
        {previousSession && (
          <div className="previous-session">
            <h3>Previous Session</h3>
            <p>Code: <strong>{previousSession.sessionCode}</strong></p>
            <p>Name: <strong>{previousSession.playerName}</strong></p>
            <button 
              onClick={handleRejoin}
              className="action-button join-button"
            >
              <span className="button-icon">↩️</span>
              Rejoin Previous Game
              <span className="button-description">Continue your previous session</span>
            </button>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="sessionCode">Session Code:</label>
          <input
            id="sessionCode"
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
            placeholder="Enter session code"
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="playerName">Your Name:</label>
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
          className="action-button join-button"
        >
          <span className="button-icon">👋</span>
          {joining ? 'Joining...' : 'Join Game'}
          <span className="button-description">Join an existing game session</span>
        </button>

        {errorMessage && (
          <div className="error">
            <span className="error-icon">⚠️</span>
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerView; 