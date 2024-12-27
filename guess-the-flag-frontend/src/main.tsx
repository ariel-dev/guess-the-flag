// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
// import { ActionCableProvider } from 'react-actioncable-provider';

const cableUrl = 'ws://localhost:3000/cable'; // Ensure this matches your Rails ActionCable setup

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      {/* <ActionCableProvider url={cableUrl}> */}
        <App />
      {/* </ActionCableProvider> */}
    </ApolloProvider>
  </React.StrictMode>,
);
