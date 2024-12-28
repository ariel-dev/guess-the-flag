import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ActionCableConsumer } from 'react-actioncable-provider';
import { GET_GAME_SESSION, SUBMIT_ANSWER } from '../graphql/queries';

function GamePage({ sessionCode, player }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [score, setScore] = useState(player.score || 0);
  const [answersSubmitted, setAnswersSubmitted] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);

  const { data: gameData, loading, error, refetch } = useQuery(GET_GAME_SESSION, {
    variables: { sessionCode },
    fetchPolicy: 'network-only',
  });

  const [submitAnswer, { loading: submitting }] = useMutation(SUBMIT_ANSWER, {
    onCompleted: (data) => {
      setLastAnswerCorrect(data.submitAnswer.correct);
      setScore(data.submitAnswer.updatedScore);
      setSelectedAnswer(null);
    },
  });

  const handleReceived = (data) => {
    switch (data.event) {
      case 'next_question':
      case 'game_started':
        setSelectedAnswer(null);
        setLastAnswerCorrect(null);
        refetch();
        break;
      case 'answer_progress':
        setAnswersSubmitted(data.data.answered);
        setTotalPlayers(data.data.total);
        break;
      case 'game_finished':
        // Handle game finished
        break;
    }
  };

  const handleAnswerSelect = (choiceId) => {
    if (submitting || selectedAnswer) return;
    
    setSelectedAnswer(choiceId);
    submitAnswer({
      variables: {
        questionId: gameData.gameSession.currentQuestion.id,
        answerId: choiceId,
        playerId: player.id,
      },
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!gameData?.gameSession?.currentQuestion) return <div>Waiting for game to start...</div>;

  const { currentQuestion } = gameData.gameSession;

  return (
    <div className="game-page">
      <ActionCableConsumer
        channel={{ channel: 'GameSessionChannel', session_code: sessionCode }}
        onReceived={handleReceived}
      />

      <div className="game-header">
        <div className="score">Score: {score}</div>
        <div className="progress">
          {answersSubmitted > 0 && (
            <div>Answers submitted: {answersSubmitted}/{totalPlayers}</div>
          )}
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
              onClick={() => handleAnswerSelect(choice.id)}
              disabled={selectedAnswer !== null}
              className={`choice-button ${
                selectedAnswer === choice.id ? 'selected' : ''
              }`}
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
  );
}

export default GamePage;
