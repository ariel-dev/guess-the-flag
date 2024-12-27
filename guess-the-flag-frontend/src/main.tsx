// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApolloProvider } from '@apollo/client';
import ActionCableProvider from 'react-actioncable-provider';
import client from './apolloClient';
import './styles.css';

const cableUrl = 'ws://localhost:3000/cable';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <ActionCableProvider url={cableUrl}>
        <div className="app-container">
          <header className="app-header">
            <h1>🎌 Guess The Flag</h1>
          </header>
          <main className="app-main">
            <App />
          </main>
          <footer className="app-footer">
            <p>A fun way to learn about flags from around the world!</p>
          </footer>
        </div>
      </ActionCableProvider>
    </ApolloProvider>
  </React.StrictMode>,
);
