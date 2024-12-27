// src/components/PlayerView.tsx
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { JOIN_GAME_SESSION, MARK_PLAYER_READY } from '../queriesAndMutations';

export default function PlayerView() {
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [player, setPlayer] = useState<any>(null); // store the joined player info

  // 1. Join Game Session mutation
  const [joinGameSession, { loading: joining, error: joinError }] = useMutation(
    JOIN_GAME_SESSION,
    {
      onCompleted: (data) => {
        // store the returned player object
        setPlayer(data.joinGameSession.player);
      },
    }
  );

  // 2. Mark Player Ready mutation
  const [markPlayerReady, { loading: togglingReady, error: readyError }] =
    useMutation(MARK_PLAYER_READY, {
      onCompleted: (data) => {
        // update the local player state with new "ready" status
        setPlayer(data.markPlayerReady.player);
      },
    });

  const handleJoin = () => {
    joinGameSession({
      variables: {
        sessionCode,
        playerName,
      },
    });
  };

  const handleToggleReady = () => {
    if (!player) return;
    markPlayerReady({
      variables: {
        playerId: player.id,
      },
    });
  };

  if (player) {
    // Already joined
    return (
      <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
        <h2>Player View</h2>
        <p>
          Joined session: <strong>{player.gameSession.sessionCode}</strong>
        </p>
        <p>
          You are <strong>{player.name}</strong>. Ready?{' '}
          <strong>{player.ready ? 'Yes' : 'No'}</strong>
        </p>
        <button onClick={handleToggleReady} disabled={togglingReady}>
          {togglingReady ? 'Updating...' : 'Toggle Ready'}
        </button>
        {readyError && (
          <p style={{ color: 'red' }}>Error toggling ready: {readyError.message}</p>
        )}
      </div>
    );
  }

  // Not yet joined => show form
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h2>Player View</h2>
      <div>
        <label>Session Code: </label>
        <input
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value)}
          placeholder="ABC123"
        />
      </div>
      <div>
        <label>Player Name: </label>
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Alice"
        />
      </div>
      <button onClick={handleJoin} disabled={joining}>
        {joining ? 'Joining...' : 'Join Session'}
      </button>

      {joinError && (
        <p style={{ color: 'red' }}>Error joining session: {joinError.message}</p>
      )}
    </div>
  );
}
