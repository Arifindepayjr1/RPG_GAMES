// src/App.jsx
import React, { useState } from 'react';
import Game from '../';
import Menu from './components/Menu';

function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);

  const handleStartGame = () => {
    console.log("handleStartGame called in App.jsx");
    setIsGameStarted(true);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'gray',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      {isGameStarted ? <Game /> : <Menu onStartGame={handleStartGame} />}
    </div>
  );
}

export default App;