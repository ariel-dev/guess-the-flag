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
        flag {
          imageUrl
        }
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
  mutation StartGame($sessionCode: String!, $maxQuestions: Int) {
    startGame(sessionCode: $sessionCode, maxQuestions: $maxQuestions) {
      gameSession {
        id
        sessionCode
        active
        currentQuestion {
          id
          prompt
          flag {
            imageUrl
          }
          choices {
            id
            label
          }
        }
      }
      errors
    }
  }
`;

export const JOIN_GAME_SESSION = gql`
  mutation JoinGameSession($sessionCode: String!, $playerName: String!, $existingPlayerId: ID) {
    joinGameSession(sessionCode: $sessionCode, playerName: $playerName, existingPlayerId: $existingPlayerId) {
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
  mutation SubmitAnswer($questionId: ID!, $answerId: ID!, $playerId: ID!) {
    submitAnswer(questionId: $questionId, answerId: $answerId, playerId: $playerId) {
      success
      correct
      updatedScore
    }
  }
`;

export const CANCEL_GAME_SESSION = gql`
  mutation CancelGameSession($sessionCode: String!) {
    cancelGameSession(sessionCode: $sessionCode) {
      success
      errors
    }
  }
`;

export const REMOVE_PLAYER = gql`
  mutation RemovePlayer($playerId: ID!, $sessionCode: String!) {
    removePlayer(playerId: $playerId, sessionCode: $sessionCode) {
      success
      errors
    }
  }
`;