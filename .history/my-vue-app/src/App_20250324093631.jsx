// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import Game from '../src/component/Game';
import Menu from '../src/component/menu';

function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const soundtrackRef = useRef(null); // Ref to hold the audio from Menu

  const handleStartGame = () => {
    console.log("handleStartGame called in App.jsx");
    setIsGameStarted(true);
  };

  // Stop the audio when the game starts
  useEffect(() => {
    if (isGameStarted && soundtrackRef.current) {
      console.log("Game started, stopping menu soundtrack");
      soundtrackRef.current.pause();
      soundtrackRef.current.currentTime = 0; // Reset the audio to the beginning
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
      ) : (
        <Menu
          onStartGame={handleStartGame}
          setSoundtrackRef={(audio) => {
            soundtrackRef.current = audio; // Pass the audio ref from Menu to App
          }}
        />
      )}
    </div>
  );
}

export default App;