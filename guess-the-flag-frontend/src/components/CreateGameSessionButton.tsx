// src/components/CreateGameSessionButton.tsx
import { useMutation } from '@apollo/client';
import { CREATE_GAME_SESSION } from '../mutations';

export default function CreateGameSessionButton() {
  const [createSession, { data, loading, error }] = useMutation(CREATE_GAME_SESSION);

  const handleClick = async () => {
    try {
      await createSession(); // triggers the mutation
      alert('Game session created!');
    } catch (err) {
      console.error('Error creating session:', err);
    }
  };

  if (loading) return <p>Creating session...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <button onClick={handleClick}>Create Game Session</button>
      {data && (
        <p>
          Created session: {data.createGameSession.gameSession.id} -{' '}
          {data.createGameSession.gameSession.sessionCode}
        </p>
      )}
    </div>
  );
}
