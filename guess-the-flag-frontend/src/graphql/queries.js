import { gql } from '@apollo/client';

export const GET_GAME_SESSION = gql`
  query GetGameSession($sessionCode: String!) {
    gameSession(sessionCode: $sessionCode) {
      id
      sessionCode
      active
      completed
      currentQuestion {
        id
        prompt
        flag {
          imageUrl
        }
        choices {
          id
          label
          isCorrect
        }
      }
      players {
        id
        name
        ready
        score
        isHost
      }
    }
  }
`;

export const CREATE_GAME_SESSION = gql`
  mutation CreateGameSession($hostName: String!) {
    createGameSession(hostName: $hostName) {
      gameSession {
        id
        sessionCode
        active
      }
      hostPlayer {
        id
        name
        ready
        score
        isHost
      }
    }
  }
`;

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
  mutation JoinGameSession($sessionCode: String!, $name: String!, $playerId: ID) {
    joinGameSession(sessionCode: $sessionCode, name: $name, playerId: $playerId) {
      success
      errors
      player {
        id
        name
        score
        ready
        isHost
      }
    }
  }
`;

export const MARK_PLAYER_READY = gql`
  mutation MarkPlayerReady($playerId: ID!) {
    markPlayerReady(playerId: $playerId) {
      player {
        id
        ready
      }
    }
  }
`;

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

export const GET_FLAGS = gql`
  query GetFlags {
    flags {
      id
      name
      imageUrl
    }
  }
`;

export const LEAVE_GAME_SESSION = gql`
  mutation LeaveGameSession($playerId: ID!, $sessionCode: String!) {
    leaveGameSession(playerId: $playerId, sessionCode: $sessionCode) {
      success
      errors
    }
  }
`; 