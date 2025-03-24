// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import Game from '../src/component/Game';
import Menu from '../src/component/menu';

function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const soundtrackRef = useRef(null);

  const handleStartGame = () => {
    console.log("handleStartGame called in App.jsx");
    setIsGameStarted(true);
  };

  const handleEnterGame = () => {
    console.log("User clicked to enter, showing menu");
    setShowMenu(true);
  };

  useEffect(() => {
    if (isGameStarted && soundtrackRef.current) {
      console.log("Game started, stopping menu soundtrack");
      soundtrackRef.current.pause();
      soundtrackRef.current.currentTime = 0;
    }
  }, [isGameStarted]);

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
      {isGameStarted ? (
        <Game />
      ) : showMenu ? (
        <Menu
          onStartGame={handleStartGame}
          setSoundtrackRef={(audio) => {
            soundtrackRef.current = audio;
          }}
        />
      ) : (
        <div
          style={{
            textAlign: 'center',
            color: 'black',
            fontSize: '24px',
            cursor: 'pointer',
          }}
          onClick={handleEnterGame}
        >
          Click to Enter
        </div>
      )}
    </div>
  );
}

export default App;