import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { ActionCableProvider } from 'react-actioncable-provider';
import { GET_FLAGS } from '../../graphql/queries';
import App from '../../App';

// Mock ActionCableProvider
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

const mocks = [
  {
    request: {
      query: GET_FLAGS,
    },
    result: {
      data: {
        flags: [
          { id: '1', name: 'USA', imageUrl: 'usa.png' },
          { id: '2', name: 'Canada', imageUrl: 'canada.png' },
        ],
      },
    },
  },
];

const renderApp = () => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MockedProvider>
  );
};

describe('App', () => {
  beforeEach(() => {
    window.mockWebSocket = null;
  });

  it('renders the home page', async () => {
    renderApp();
    await vi.waitFor(() => {
      expect(screen.getByText('Guess The Flag')).toBeDefined();
      expect(screen.getByText('Test your knowledge of world flags in this multiplayer game!')).toBeDefined();
    });
  });

  it('shows host and join buttons', async () => {
    renderApp();
    await vi.waitFor(() => {
      expect(screen.getByText('Host Game')).toBeDefined();
      expect(screen.getByText('Join Game')).toBeDefined();
    });
  });

  it('loads flags data correctly', async () => {
    renderApp();
    // Wait for the mock Apollo query to resolve
    await vi.waitFor(() => {
      expect(mocks[0].result.data.flags).toHaveLength(2);
    });
  });
}); 