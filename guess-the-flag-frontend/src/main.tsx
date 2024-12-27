// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApolloProvider } from '@apollo/client';
import { ActionCableProvider } from 'react-actioncable-provider';
import { createConsumer } from '@rails/actioncable';
import client from './apolloClient';
import './styles.css';

const cable = createConsumer('ws://localhost:3000/cable');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <ActionCableProvider cable={cable}>
        <App />
      </ActionCableProvider>
    </ApolloProvider>
  </React.StrictMode>,
);
