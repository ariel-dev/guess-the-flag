// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import HostView from './components/HostView';
import PlayerView from './components/PlayerView';

function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Guess The Flag</h1>
      {/* Minimal example: show both on the same page for testing */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <HostView />
        <PlayerView />
      </div>
    </div>
  );
}

export default App
