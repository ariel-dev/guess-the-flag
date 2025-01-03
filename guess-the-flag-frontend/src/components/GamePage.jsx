import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_GAME_SESSION, SUBMIT_ANSWER } from '../graphql/queries';
import WaitingRoom from './WaitingRoom';
import { useWebSocket } from '../hooks/useWebSocket';

function GamePage({ sessionCode, player }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [score, setScore] = useState(player.score || 0);
  const [answersSubmitted, setAnswersSubmitted] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [finalScores, setFinalScores] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const timerRef = useRef(null);

  const { data: gameData, loading, error, refetch } = useQuery(GET_GAME_SESSION, {
    variables: { sessionCode },
    fetchPolicy: 'network-only',
  });

  const startTimer = useCallback((endTimeStr) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Store end time in localStorage for rejoins
    localStorage.setItem('questionEndTime', endTimeStr);

    const endTime = new Date(endTimeStr);

    // Update timer immediately
    const updateTimer = () => {
      const now = new Date();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      setTimeRemaining(remaining);

      // Clear interval if time is up
      if (remaining === 0 && timerRef.current) {
        clearInterval(timerRef.current);
        localStorage.removeItem('questionEndTime');
      }
    };

    // Start interval
    updateTimer();
    timerRef.current = setInterval(updateTimer, 100); // Update every 100ms for smooth countdown
  }, []);

  const handleReceived = useCallback((data) => {
    console.log('Received WebSocket message:', data);
    
    switch (data.event) {
      case 'next_question':
      case 'game_started':
        setSelectedAnswer(null);
        setLastAnswerCorrect(null);
        setAnswersSubmitted(0);
        setTimeRemaining(0);
        setFinalScores(null);
        refetch();
        break;
      case 'answer_progress':
        setAnswersSubmitted(data.data.answered);
        setTotalPlayers(data.data.total);
        break;
      case 'answer_submitted':
        if (data.data.player_id === player.id) {
          setLastAnswerCorrect(data.data.correct);
          setScore(data.data.score);
        }
        break;
      case 'game_finished':
        setSelectedAnswer(null);
        setLastAnswerCorrect(null);
        setFinalScores(data.data.final_scores);
        refetch();
        break;
      case 'game_cancelled':
        setSelectedAnswer(null);
        setLastAnswerCorrect(null);
        setAnswersSubmitted(0);
        setFinalScores(null);
        refetch();
        break;
      case 'question_timer_start':
        startTimer(data.data.end_time);
        break;
      case 'question_time_up':
        setTimeRemaining(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          localStorage.removeItem('questionEndTime');
        }
        break;
    }
  }, [player.id, refetch, startTimer]);

  // Setup WebSocket connection
  useWebSocket({
    sessionCode,
    onReceived: handleReceived,
    setWsConnected
  });

  const [submitAnswer, { loading: submitting }] = useMutation(SUBMIT_ANSWER, {
    onCompleted: (data) => {
      setLastAnswerCorrect(data.submitAnswer.correct);
      setScore(data.submitAnswer.updatedScore);
      setSelectedAnswer(null);
    },
  });

  useEffect(() => {
    // If there's an active question when component mounts (e.g., on rejoin),
    // check if we need to start the timer
    if (gameData?.gameSession?.currentQuestion) {
      const endTimeFromServer = localStorage.getItem('questionEndTime');
      if (endTimeFromServer) {
        startTimer(endTimeFromServer);
      }
    }

    return () => {
      // Cleanup timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameData]);

  const handleAnswerSelect = (choice) => {
    if (submitting || selectedAnswer || timeRemaining === 0) return;
    
    setSelectedAnswer(choice.id);
    setLastAnswerCorrect(choice.isCorrect);
    submitAnswer({
      variables: {
        questionId: gameData.gameSession.currentQuestion.id,
        answerId: choice.id,
        playerId: player.id,
      },
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (finalScores) {
    return (
      <div className="game-page">
        <div className="leaderboard">
          <h2>🏆 Game Over - Final Scores 🏆</h2>
          <div className="final-scores">
            {finalScores.map((playerScore, index) => (
              <div 
                key={playerScore.id} 
                className={`player-score-item ${playerScore.id === player.id ? 'current-player' : ''}`}
              >
                <div className="rank">{index + 1}</div>
                <div className="player-details">
                  <span className="player-name">{playerScore.name}</span>
                  <span className="final-score">Score: {playerScore.score}</span>
                </div>
                {index === 0 && <span className="trophy">👑</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!gameData?.gameSession?.currentQuestion) {
    return (
      <div className="game-page">
        <WaitingRoom
          sessionCode={sessionCode}
          player={player}
          players={gameData?.gameSession?.players}
          wsConnected={wsConnected}
          onMarkReady={() => {}}
          onLeaveGame={() => {}}
          isHost={player.isHost}
        />
      </div>
    );
  }

  const { currentQuestion } = gameData.gameSession;

  return (
    <div className="game-page">
      <div className="game-content">
        <div className="game-header">
          <div className="score">Score: {score}</div>
          <div className="timer">Time: {timeRemaining}s</div>
          <div className="progress">
            {<div>Answers submitted: {answersSubmitted}/{totalPlayers}</div>}
          </div>
        </div>

        <div className="question-container">
          <h2>{currentQuestion.prompt}</h2>
          
          <div className="flag-container">
            <img 
              src={currentQuestion.flag.imageUrl} 
              alt="Flag" 
              className="flag-image"
            />
          </div>

          <div className="choices-grid">
            {currentQuestion.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleAnswerSelect(choice)}
                disabled={selectedAnswer !== null || timeRemaining === 0}
                className={`choice-button ${
                  selectedAnswer === choice.id ? 'selected' : ''
                } ${timeRemaining === 0 ? 'disabled' : ''}`}
              >
                {choice.label}
              </button>
            ))}
          </div>

          {lastAnswerCorrect !== null && (
            <div className={`answer-result ${lastAnswerCorrect ? 'correct' : 'incorrect'}`}>
              {lastAnswerCorrect ? '✅ Correct!' : '❌ Incorrect'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GamePage;
