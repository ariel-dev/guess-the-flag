import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { JOIN_GAME_SESSION, MARK_PLAYER_READY, GET_GAME_SESSION, LEAVE_GAME_SESSION } from '../graphql/queries';
import { ActionCableConsumer } from 'react-actioncable-provider';
import GamePage from './GamePage';
import WaitingRoom from './WaitingRoom';

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
    onCompleted: (data) => {
      console.log('Game session data received:', data);
      if (data?.gameSession?.active && data?.gameSession?.currentQuestion) {
        console.log('Setting game as started from query');
        setGameStarted(true);
      }
    }
  });

  const [joinGame, { loading: joining }] = useMutation(JOIN_GAME_SESSION, {
    variables: { sessionCode },
    onCompleted: (data) => {
      console.log('Join game completed:', data);
      if (data.joinGameSession.success) {
        const joinedPlayer = data.joinGameSession.player;
        setPlayer(joinedPlayer);
        saveSessionData(sessionCode, joinedPlayer);
        setErrorMessage(null);
        
        // Immediately check game state after joining
        refetch().then(({ data }) => {
          console.log('Checking game state after join:', data);
          if (data?.gameSession?.active && data?.gameSession?.currentQuestion) {
            console.log('Setting game as started after join');
            setGameStarted(true);
          }
        });
      } else {
        setErrorMessage(data.joinGameSession.errors.join(', '));
      }
    },
    onError: (error) => {
      console.error('Join game error:', error);
      setErrorMessage(error.message);
    },
  });

  const [markReady] = useMutation(MARK_PLAYER_READY, {
    onCompleted: (data) => {
      setPlayer(prev => ({ ...prev, ready: data.markPlayerReady.player.ready }));
    },
  });

  const [leaveGame] = useMutation(LEAVE_GAME_SESSION, {
    onCompleted: () => {
      setPlayer(null);
      setGameStarted(false);
      setSessionCode('');
      setPlayerName('');
      localStorage.removeItem('previousSession');
      setPreviousSession(null);
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const handleJoin = () => {
    if (!sessionCode.trim() || !playerName.trim()) return;
    setErrorMessage(null);
    joinGame({
      variables: {
        sessionCode: sessionCode.trim(),
        name: playerName.trim(),
      },
    }).catch(error => {
      setErrorMessage(error.message);
    });
  };

  const handleRejoin = () => {
    if (!previousSession) return;
    console.log('Starting rejoin process with session:', previousSession);
    setErrorMessage(null);
    setSessionCode(previousSession.sessionCode);
    
    // First check if the game session exists and is active
    refetch({
      variables: { sessionCode: previousSession.sessionCode }
    }).then(({ data }) => {
      if (!data?.gameSession) {
        throw new Error('Game session no longer exists');
      }
      
      // If session exists, attempt to rejoin
      return joinGame({
        variables: {
          sessionCode: previousSession.sessionCode,
          name: previousSession.playerName,
          playerId: previousSession.playerId
        },
      });
    }).then((response) => {
      if (response.data.joinGameSession.success) {
        console.log('Successfully rejoined, resetting WebSocket');
        // Re-establish WebSocket connection
        setWsConnected(false);
        return new Promise(resolve => setTimeout(() => {
          setWsConnected(true);
          resolve();
        }, 100));
      } else {
        throw new Error(response.data.joinGameSession.errors.join(', '));
      }
    }).then(() => {
      console.log('WebSocket reset, fetching game state');
      // Fetch the latest game state
      return refetch();
    }).then(({ data }) => {
      console.log('Game state after rejoin:', data);
      // Check if game is active and has a current question
      if (data?.gameSession?.active && data?.gameSession?.currentQuestion) {
        console.log('Game is active, updating state');
        setGameStarted(true);
      }
    }).catch(error => {
      console.error('Error during rejoin:', error);
      setErrorMessage(error.message);
      // Clear previous session data if the session no longer exists
      localStorage.removeItem('previousSession');
      setPreviousSession(null);
    });
  };

  const handleReceived = (data) => {
    console.log('Received WebSocket message:', data);
    switch (data.event) {
      case 'game_started':
      case 'next_question':
        setGameStarted(true);
        refetch();
        break;
      case 'game_cancelled':
        // Show a message to the user that the game has been cancelled
        setErrorMessage("The host has ended the game session. You can join a new game or return to the menu.");
        break;
      default:
        refetch();
        break;
    }
  };

  const handleLeaveGame = () => {
    if (!player || !sessionCode) return;
    
    leaveGame({
      variables: {
        playerId: player.id,
        sessionCode: sessionCode,
      },
    }).then(() => {
      onBack();
    }).catch(error => {
      setErrorMessage(error.message);
    });
  };

  if (gameStarted && player) {
    return (
      <>
        <button 
          className="back-button leave-button"
          onClick={handleLeaveGame}
        >
          <span className="button-icon">🚪</span>
          Leave Game
        </button>
        <GamePage sessionCode={sessionCode} player={player} />
      </>
    );
  }

  if (player) {
    return (
      <div className="game-container">
        <ActionCableConsumer
          channel={{ channel: 'GameSessionChannel', session_code: sessionCode }}
          onConnected={() => {
            console.log('WebSocket connected');
            setWsConnected(true);
          }}
          onDisconnected={() => {
            console.log('WebSocket disconnected');
            setWsConnected(false);
          }}
          onReceived={(data) => {
            console.log('Received WebSocket message:', data);
            handleReceived(data);
          }}
        />
        <div className="header-buttons">
          <button 
            className="back-button"
            onClick={onBack}
          >
            <span className="button-icon">←</span>
            Back to Menu
          </button>
        </div>
        <WaitingRoom
          sessionCode={sessionCode}
          player={player}
          players={sessionData?.gameSession?.players}
          wsConnected={wsConnected}
          onMarkReady={() => markReady({ variables: { playerId: player.id } })}
          onLeaveGame={handleLeaveGame}
          isHost={player.isHost}
        />
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
        
        {previousSession && !errorMessage?.includes('no longer exists') && (
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