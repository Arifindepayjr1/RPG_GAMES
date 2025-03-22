// src/App.jsx
import React, { useState } from 'react';
import Game from '../src/component/Game';
import Menu from '../src/component/menu';

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
        background: 'white',
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