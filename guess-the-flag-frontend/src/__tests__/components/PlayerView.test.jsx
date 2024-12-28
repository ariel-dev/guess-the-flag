import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import { ActionCableProvider } from 'react-actioncable-provider';
import PlayerView from '../../components/PlayerView';
import { JOIN_GAME_SESSION, GET_GAME_SESSION } from '../../graphql/queries';

// Mock ActionCableConsumer component
vi.mock('react-actioncable-provider', () => ({
  ActionCableProvider: ({ children }) => children,
  ActionCableConsumer: ({ onConnected, onDisconnected, onReceived, children }) => {
    // Expose the handlers to the test environment
    window.mockWebSocket = {
      onConnected,
      onDisconnected,
      onReceived
    };
    return children;
  }
}));

const mockQueries = [
  {
    request: {
      query: JOIN_GAME_SESSION,
      variables: { sessionCode: 'TEST123', name: 'TestPlayer' }
    },
    result: {
      data: {
        joinGameSession: {
          success: true,
          player: {
            id: '1',
            name: 'TestPlayer',
            ready: false
          }
        }
      }
    }
  },
  {
    request: {
      query: GET_GAME_SESSION,
      variables: { sessionCode: 'TEST123' }
    },
    result: {
      data: {
        gameSession: {
          active: false,
          players: [
            {
              id: '1',
              name: 'TestPlayer',
              ready: false
            }
          ]
        }
      }
    }
  }
];

describe('PlayerView WebSocket functionality', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    window.mockWebSocket = null;
  });

  it('shows connection status when connected', async () => {
    render(
      <MockedProvider mocks={mockQueries} addTypename={false}>
        <PlayerView onBack={mockOnBack} />
      </MockedProvider>
    );

    // Join game
    fireEvent.change(screen.getByPlaceholderText(/enter game code/i), {
      target: { value: 'TEST123' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your name/i), {
      target: { value: 'TestPlayer' }
    });
    fireEvent.click(screen.getByText(/join game/i));

    // Simulate WebSocket connection
    await vi.waitFor(() => {
      window.mockWebSocket.onConnected();
      expect(screen.getByText('Connected')).toBeDefined();
    });
  });

  it('updates game state when receiving game_started message', async () => {
    render(
      <MockedProvider mocks={mockQueries} addTypename={false}>
        <PlayerView onBack={mockOnBack} />
      </MockedProvider>
    );

    // Join game
    fireEvent.change(screen.getByPlaceholderText(/enter game code/i), {
      target: { value: 'TEST123' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your name/i), {
      target: { value: 'TestPlayer' }
    });
    fireEvent.click(screen.getByText(/join game/i));

    // Simulate receiving game_started message
    await vi.waitFor(() => {
      window.mockWebSocket.onReceived({ event: 'game_started' });
      expect(screen.getByText(/leave game/i)).toBeDefined();
    });
  });

  it('shows error message when game is cancelled', async () => {
    render(
      <MockedProvider mocks={mockQueries} addTypename={false}>
        <PlayerView onBack={mockOnBack} />
      </MockedProvider>
    );

    // Join game
    fireEvent.change(screen.getByPlaceholderText(/enter game code/i), {
      target: { value: 'TEST123' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your name/i), {
      target: { value: 'TestPlayer' }
    });
    fireEvent.click(screen.getByText(/join game/i));

    // Simulate receiving game_cancelled message
    await vi.waitFor(() => {
      window.mockWebSocket.onReceived({ event: 'game_cancelled' });
      expect(screen.getByText(/the host has ended the game session/i)).toBeDefined();
    });
  });
}); 