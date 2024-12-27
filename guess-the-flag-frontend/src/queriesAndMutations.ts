import { gql } from '@apollo/client';

// Query to get the current game session and its current question
export const GET_GAME_SESSION = gql`
  query GetGameSession($sessionCode: String!) {
    gameSession(sessionCode: $sessionCode) {
      id
      sessionCode
      active
      currentQuestion {
        id
        prompt
        imageUrl
        choices {
          id
          label
        }
      }
      players {
        id
        name
        ready
        score
      }
    }
  }
`;

export const CREATE_GAME_SESSION = gql`
  mutation CreateGameSession {
    createGameSession {
      gameSession {
        id
        sessionCode
        active
      }
    }
  }
`;

// Mutation to start the game
export const START_GAME = gql`
  mutation StartGame($sessionCode: String!) {
    startGame(sessionCode: $sessionCode) {
      gameSession {
        id
        sessionCode
        active
        currentQuestion {
          id
          prompt
          imageUrl
          choices {
            id
            label
          }
        }
      }
      success
    }
  }
`;

export const JOIN_GAME_SESSION = gql`
  mutation JoinGameSession($sessionCode: String!, $playerName: String!) {
    joinGameSession(sessionCode: $sessionCode, playerName: $playerName) {
      player {
        id
        name
        ready
        score
        gameSession {
          id
          sessionCode
        }
      }
    }
  }
`;

export const MARK_PLAYER_READY = gql`
  mutation MarkPlayerReady($playerId: ID!) {
    markPlayerReady(playerId: $playerId) {
      player {
        id
        name
        ready
        score
      }
    }
  }
`;

export const GET_FLAGS = gql`
  query GetFlags {
    flags {
      id
      name
      imageUrl
    }
  }
`;

export const GET_CURRENT_QUESTION = gql`
  query GetCurrentQuestion($sessionCode: String!) {
    getCurrentQuestion(sessionCode: $sessionCode) {
      id
      flagImageUrl
      timeLimit
      choices {
        id
        text
      }
    }
  }
`;

// Mutation to submit an answer
export const SUBMIT_ANSWER = gql`
  mutation SubmitAnswer($questionId: ID!, $answerId: ID!) {
    submitAnswer(questionId: $questionId, answerId: $answerId) {
      success
      correct
      updatedScore
    }
  }
`;