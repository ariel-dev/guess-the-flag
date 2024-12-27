// src/components/GamePage.tsx
import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
// If you're using ActionCable in React, you might also import your cable subscription logic here

// Example GQL queries/mutations (replace with your real definitions)
const GET_CURRENT_QUESTION = gql`
  query GetCurrentQuestion($sessionCode: String!) {
    gameSession(sessionCode: $sessionCode) {
      id
      sessionCode
      currentQuestion {
        id
        prompt       # e.g. "Which flag is this?"
        imageUrl     # For displaying the flag image
        choices {    # array of possible answers
          id
          label      # e.g. "Brazil", "Germany", etc.
        }
        timeLeft     # optional field if you want the server to store countdown
      }
    }
  }
`;

const SUBMIT_ANSWER = gql`
  mutation SubmitAnswer($questionId: ID!, $answerId: ID!) {
    submitAnswer(questionId: $questionId, answerId: $answerId) {
      success
      correct
      updatedScore
    }
  }
`;

type Choice = {
  id: string;
  label: string;
};

type Question = {
  id: string;
  prompt: string;
  imageUrl?: string;
  choices: Choice[];
  timeLeft?: number; // optional
};

type GameSessionData = {
  gameSession: {
    id: string;
    sessionCode: string;
    currentQuestion?: Question | null;
  };
};

interface GamePageProps {
  sessionCode: string; // The player's current session code
  playerId: string;    // The player's ID
  onDone?: () => void; // Callback if the game ends
}

export default function GamePage({ sessionCode, playerId, onDone }: GamePageProps) {
  const [localTimeLeft, setLocalTimeLeft] = useState<number | null>(null);
  const { data, loading, error, refetch } = useQuery<GameSessionData>(
    GET_CURRENT_QUESTION,
    {
      variables: { sessionCode },
      pollInterval: 5000, // or remove this if using ActionCable for realtime
      fetchPolicy: 'network-only',
    }
  );

  const [submitAnswer, { loading: answerSubmitting }] = useMutation(SUBMIT_ANSWER);

  // If your server calculates the time, you can copy that to local state for a countdown
  useEffect(() => {
    if (data?.gameSession?.currentQuestion?.timeLeft != null) {
      setLocalTimeLeft(data.gameSession.currentQuestion.timeLeft);
    }
  }, [data]);

  // Example local countdown effect
  useEffect(() => {
    let timer: number | undefined;
    if (localTimeLeft != null && localTimeLeft > 0) {
      timer = window.setInterval(() => {
        setLocalTimeLeft((t) => (t == null ? 0 : t - 1));
      }, 1000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [localTimeLeft]);

  // If you also have ActionCable subscription:
  // - Connect to game_session_{sessionCode}
  // - on "next_question" or "show_results" event, refetch the query or update local state

  if (loading) return <p>Loading question...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error.message}</p>;

  const question = data?.gameSession?.currentQuestion;
  if (!question) {
    return <p>Waiting for next question... (Host might not have started the game)</p>;
  }

  const handleChoiceClick = async (answerId: string) => {
    try {
      await submitAnswer({
        variables: {
          questionId: question.id,
          answerId,
        },
      });
      // Optionally, refetch or rely on server broadcast to update state
      alert('Answer submitted. Waiting for other players or next question...');
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      alert(err.message);
    }
  };

  return (
    <div>
      <h2>GamePage for Session {sessionCode}</h2>
      <div style={{ marginBottom: '1rem' }}>
        {question.imageUrl && (
          <img src={question.imageUrl} alt="question" style={{ maxWidth: '300px' }} />
        )}
        <p>{question.prompt}</p>
        {localTimeLeft != null && localTimeLeft > 0 && (
          <p>Time left: {localTimeLeft} seconds</p>
        )}
      </div>

      <div>
        {question.choices.map((choice) => (
          <button
            key={choice.id}
            disabled={answerSubmitting || (localTimeLeft != null && localTimeLeft <= 0)}
            onClick={() => handleChoiceClick(choice.id)}
            style={{ display: 'block', margin: '0.5rem 0' }}
          >
            {choice.label}
          </button>
        ))}
      </div>

      {answerSubmitting && <p>Submitting answer...</p>}
    </div>
  );
}
