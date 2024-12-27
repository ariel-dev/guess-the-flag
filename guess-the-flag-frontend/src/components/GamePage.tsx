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
  flag: {
    imageUrl: string;
  };
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
  playerId: string;
};

interface GamePageProps {
  sessionCode: string;
  playerId: string;
}

export default function GamePage({ sessionCode, playerId }: GamePageProps) {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(10); // 10 seconds countdown
  const [gameState, setGameState] = useState<'playing' | 'waiting' | 'results'>('playing');
  const [answerFeedback, setAnswerFeedback] = useState<{
    show: boolean;
    correct: boolean;
    score: number;
  } | null>(null);
  const [questionsRemaining, setQuestionsRemaining] = useState<number>(10);

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
        setAnswerFeedback({
          show: true,
          correct: data.submitAnswer.correct,
          score: data.submitAnswer.updatedScore
        });
        // Auto-hide feedback after 2.5 seconds
        setTimeout(() => {
          setAnswerFeedback(null);
        }, 2500);
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
    console.log('Received event:', event, data);
    
    if (event === 'next_question') {
      setSelectedAnswerId(null);
      setTimer(10);
      setGameState('playing');
      setAnswerFeedback(null);
      setQuestionsRemaining(data.questions_remaining);
      refetch();
    } else if (event === 'game_finished') {
      setGameState('results');
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (!selectedAnswerId || !data?.gameSession?.currentQuestion) return;

    submitAnswer({
      variables: {
        questionId: data.gameSession.currentQuestion.id,
        answerId: selectedAnswerId,
        playerId: playerId
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
    <div className="card">
      <h2 className="text-center mb-4">Game Page</h2>
      <div className="mb-4">
        <p>Session Code: <strong>{sessionCode}</strong></p>
        <p>Your Name: <strong>{data.gameSession.players.find(p => p.id === playerId)?.name}</strong></p>
        <p>Questions Remaining: <strong>{questionsRemaining}</strong></p>
      </div>

      {gameState === 'playing' && currentQuestion && (
        <div>
          {currentQuestion.flag?.imageUrl && (
            <img
              src={currentQuestion.flag.imageUrl}
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
                className={`answer-button ${selectedAnswerId === choice.id ? 'selected' : ''}`}
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
        <div className="text-center">
          <div className="card answer-feedback">
            {answerFeedback?.show && (
              <div className={`feedback-message ${answerFeedback.correct ? 'correct' : 'incorrect'}`}>
                <div className="feedback-icon">
                  {answerFeedback.correct ? '✓' : '✗'}
                </div>
                <h3>{answerFeedback.correct ? 'Correct!' : 'Incorrect!'}</h3>
                <p className="score-update">
                  Score: {answerFeedback.score} points
                </p>
              </div>
            )}
            <p className="mb-4">Waiting for next question...</p>
            <div className="loading-spinner"></div>
          </div>
        </div>
      )}

      {gameState === 'results' && (
        <div className="game-results">
          <h3>Game Complete! 🎉</h3>
          <h4>Final Scoreboard:</h4>
          <div className="scoreboard">
            {data.gameSession.players
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div key={player.id} className={`player-score ${player.id === playerId ? 'current-player' : ''}`}>
                  <span className="rank">#{index + 1}</span>
                  <span className="name">{player.name}</span>
                  <span className="score">{player.score} points</span>
                </div>
              ))}
          </div>
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
