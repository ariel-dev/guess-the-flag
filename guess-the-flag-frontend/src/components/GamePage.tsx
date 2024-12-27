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
  const [answerProgress, setAnswerProgress] = useState<{
    answered: number;
    total: number;
  } | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

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

  // Countdown Timer Effect with auto-submit
  useEffect(() => {
    let interval: number;
    if (gameState === 'playing' && timer > 0 && (!answerProgress || answerProgress.answered < answerProgress.total)) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && !hasSubmitted) {
      // Auto-submit when timer reaches 0
      handleAutoSubmit();
    }
    return () => window.clearInterval(interval);
  }, [gameState, timer, hasSubmitted, answerProgress]);

  // Handle automatic submission when time runs out
  const handleAutoSubmit = () => {
    if (hasSubmitted) return;
    
    const questionId = data?.gameSession?.currentQuestion?.id;
    if (!questionId) return;
    
    setHasSubmitted(true);
    setGameState('waiting');
    
    submitAnswer({
      variables: {
        questionId,
        answerId: selectedAnswerId || '0', // Use '0' or another invalid ID for no selection
        playerId: playerId
      },
    });
  };

  // Update the manual submit handler
  const handleSubmitAnswer = () => {
    if (!selectedAnswerId || !data?.gameSession?.currentQuestion || hasSubmitted) return;

    setHasSubmitted(true);
    submitAnswer({
      variables: {
        questionId: data.gameSession.currentQuestion.id,
        answerId: selectedAnswerId,
        playerId: playerId
      },
    });
  };

  // Update the handleReceived function
  const handleReceived = (response: any) => {
    const { event, data } = response;
    console.log('Received event:', event, data);
    
    if (event === 'next_question') {
      setSelectedAnswerId(null);
      setTimer(10);
      setGameState('playing');
      setAnswerFeedback(null);
      setAnswerProgress(null);
      setHasSubmitted(false); // Reset submission state
      if (data.questions_remaining !== undefined) {
        setQuestionsRemaining(data.questions_remaining);
      }
      if (data.current_question) {
        refetch();
      }
    } else if (event === 'game_finished') {
      setGameState('results');
    } else if (event === 'answer_progress') {
      setAnswerProgress(data);
    } else if (event === 'answer_submitted' && data.player_id === playerId) {
      setAnswerFeedback({
        show: true,
        correct: data.correct,
        score: data.score
      });
      setTimeout(() => {
        setAnswerFeedback(null);
      }, 2500);
    }
  };

  const handleConnected = () => {
    console.log('Connected to GameSessionChannel');
    setWsConnected(true);
    setReconnectAttempts(0);
    refetch(); // Refresh game state when connection is established
  };

  const handleDisconnected = () => {
    console.log('Disconnected from GameSessionChannel');
    setWsConnected(false);
    
    // Increment reconnection attempts
    setReconnectAttempts(prev => prev + 1);
  };

  // Add reconnection effect
  useEffect(() => {
    let reconnectTimer: number;
    
    if (!wsConnected && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      console.log(`Attempting to reconnect... (Attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
      reconnectTimer = window.setTimeout(() => {
        refetch();
      }, Math.min(1000 * Math.pow(2, reconnectAttempts), 10000)); // Exponential backoff
    }

    return () => {
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
    };
  }, [wsConnected, reconnectAttempts]);

  useEffect(() => {
    let timeout: number;
    if (gameState === 'waiting') {
      // Force move to next question after 15 seconds if stuck
      timeout = window.setTimeout(() => {
        refetch();
      }, 15000);
    }
    return () => window.clearTimeout(timeout);
  }, [gameState]);

  if (loading) return <p>Loading game...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error.message}</p>;

  const currentQuestion = data?.gameSession?.currentQuestion;

  if (!currentQuestion) {
    return <p>Waiting for the host to start the game...</p>;
  }

  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    return (
      <div className="connection-error">
        <h2>Connection Lost</h2>
        <p>Unable to connect to the game server. Please refresh the page or rejoin the game.</p>
        <button onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </div>
    );
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
          <div className="timer-container">
            <div className={`timer ${timer <= 3 ? 'timer-warning' : ''}`}>
              {timer}
            </div>
          </div>

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
            disabled={!selectedAnswerId || hasSubmitted}
            className="submit-button"
          >
            {hasSubmitted ? 'Answer Submitted' : 'Submit Answer'}
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
            <p className="mb-4">Waiting for other players...</p>
            {answerProgress && (
              <div className="answer-progress">
                <p>{answerProgress.answered} of {answerProgress.total} players have answered</p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(answerProgress.answered / answerProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
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

      <ActionCableConsumer
        channel={{ channel: 'GameSessionChannel', session_code: sessionCode }}
        onReceived={handleReceived}
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
        onRejected={() => {
          console.log('Connection rejected');
          setWsConnected(false);
          setReconnectAttempts(prev => prev + 1);
        }}
      />

      {!wsConnected && reconnectAttempts < MAX_RECONNECT_ATTEMPTS && (
        <div className="connection-warning">
          Reconnecting to game server... 
          (Attempt {reconnectAttempts + 1}/{MAX_RECONNECT_ATTEMPTS})
        </div>
      )}
    </div>
  );
}
