import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { GET_FLAGS } from '../../graphql/queries';
import App from '../../App';

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
    <MockedProvider mocks={mocks}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MockedProvider>
  );
};

describe('App', () => {
  it('renders the home page', () => {
    renderApp();
    expect(screen.getByText('Guess The Flag')).toBeInTheDocument();
    expect(screen.getByText('Test your knowledge of world flags in this multiplayer game!')).toBeInTheDocument();
  });

  it('shows host and join buttons', () => {
    renderApp();
    expect(screen.getByText('Host Game')).toBeInTheDocument();
    expect(screen.getByText('Join Game')).toBeInTheDocument();
  });
}); 