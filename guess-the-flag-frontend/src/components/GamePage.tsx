// src/components/GamePage.tsx
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_GAME_SESSION, SUBMIT_ANSWER } from '../queriesAndMutations';
import { ActionCableConsumer } from 'react-actioncable-provider';

type Choice = {
  id: string;
  label: string;
};

type Question = {
  id: string;
  prompt: string;
  imageUrl?: string;
  choices: Choice[];
};

type Player = {
  id: string;
  name: string;
  ready: boolean;
  score: number;
};

type GameSession = {
  id: string;
  sessionCode: string;
  active: boolean;
  currentQuestion?: Question | null;
  players: Player[];
};

type GameSessionData = {
  gameSession: GameSession;
};

type GameSessionVars = {
  sessionCode: string;
};

type SubmitAnswerData = {
  submitAnswer: {
    success: boolean;
    correct: boolean;
    updatedScore: number;
  };
};

type SubmitAnswerVars = {
  questionId: string;
  answerId: string;
};

interface GamePageProps {
  sessionCode: string;
  playerId: string;
}

export default function GamePage({ sessionCode, playerId }: GamePageProps) {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(10); // 10 seconds countdown
  const [gameState, setGameState] = useState<'playing' | 'waiting' | 'results'>('playing');

  // Query to get the current game session and question
  const { data, loading, error, refetch } = useQuery<GameSessionData, GameSessionVars>(
    GET_GAME_SESSION,
    {
      variables: { sessionCode },
      fetchPolicy: 'network-only',
    }
  );

  // Mutation to submit an answer
  const [submitAnswer, { loading: submitting, error: submitError }] = useMutation<
    SubmitAnswerData,
    SubmitAnswerVars
  >(SUBMIT_ANSWER, {
    onCompleted: (data) => {
      if (data.submitAnswer.success) {
        setGameState('waiting');
        // Optionally, display if the answer was correct
        alert(data.submitAnswer.correct ? 'Correct!' : 'Incorrect!');
      }
    },
  });

  // Countdown Timer Effect
  useEffect(() => {
    let interval: number;
    if (gameState === 'playing' && timer > 0) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setGameState('waiting');
    }
    return () => window.clearInterval(interval);
  }, [gameState, timer]);

  // ActionCable Subscription for real-time updates
  const handleReceived = (response: any) => {
    const { event, data } = response;
    if (event === 'next_question') {
      // Reset state for next question
      refetch();
      setSelectedAnswerId(null);
      setTimer(10); // Reset timer
      setGameState('playing');
    } else if (event === 'game_finished') {
      // Handle game end, show scoreboard
      setGameState('results');
    }
    // Handle other events as needed
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (!selectedAnswerId || !data?.gameSession?.currentQuestion) return;

    submitAnswer({
      variables: {
        questionId: data.gameSession.currentQuestion.id,
        answerId: selectedAnswerId,
      },
    });
  };

  if (loading) return <p>Loading game...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error.message}</p>;

  const currentQuestion = data?.gameSession?.currentQuestion;

  if (!currentQuestion) {
    return <p>Waiting for the host to start the game...</p>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Game Page</h2>
      <div>
        <p>Session Code: <strong>{sessionCode}</strong></p>
        <p>Your Name: <strong>{data.gameSession.players.find(p => p.id === playerId)?.name}</strong></p>
      </div>

      {gameState === 'playing' && currentQuestion && (
        <div>
          {currentQuestion.imageUrl && (
            <img
              src={currentQuestion.imageUrl}
              alt="Current Flag"
              style={{ maxWidth: '300px', marginBottom: '1rem' }}
            />
          )}
          <h3>{currentQuestion.prompt}</h3>
          <div>
            {currentQuestion.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => setSelectedAnswerId(choice.id)}
                style={{
                  display: 'block',
                  margin: '0.5rem 0',
                  backgroundColor: selectedAnswerId === choice.id ? '#d3d3d3' : '#fff',
                }}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswerId || submitting || timer === 0}
            style={{ marginTop: '1rem' }}
          >
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </button>
          <p>Time Left: {timer} seconds</p>
          {submitError && (
            <p style={{ color: 'red' }}>Error submitting answer: {submitError.message}</p>
          )}
        </div>
      )}

      {gameState === 'waiting' && (
        <div>
          <p>Waiting for other players or for the next question...</p>
        </div>
      )}

      {gameState === 'results' && (
        <div>
          <h3>Game Over!</h3>
          <h4>Scoreboard:</h4>
          <ul>
            {data.gameSession.players
              .sort((a, b) => b.score - a.score)
              .map((player) => (
                <li key={player.id}>
                  {player.name}: {player.score} points
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* ActionCable Consumer */}
      <ActionCableConsumer
        channel={{ channel: 'GameSessionChannel', session_code: sessionCode }}
        onReceived={handleReceived}
      />
    </div>
  );
}
