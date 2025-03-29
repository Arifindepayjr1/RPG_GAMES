// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import Game from "../src/component/Game";
import Menu from "../src/component/menu";

function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isExiting, setIsExiting] = useState(false); // State for exit animation
  const soundtrackRef = useRef(null);

  const handleStartGame = () => {
    console.log("handleStartGame called in App.jsx");
    setIsGameStarted(true);
    setIsExiting(false); // Reset exit state when starting a new game
  };

  const handleExitToMenu = () => {
    console.log("handleExitToMenu called in App.jsx");
    // Start the exit animation
    setIsExiting(true);
    // After a delay (to allow the fade-out animation), reset the state
    setTimeout(() => {
      setIsGameStarted(false);
      setShowMenu(false); // Return to "Click to Enter" screen
      setIsExiting(false); // Reset the exit state
      // Reload the page to fully reset the app
      window.location.reload(); // Simulates a full "exit" by reloading the app
    }, 1000); // Match this delay with the fade-out duration
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
        position: 'relative', // For the overlay
      }}
    >
      {/* Fade-out overlay for exiting */}
      {isExiting && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'black',
            opacity: 0,
            animation: 'fadeOut 1s forwards', // Fade to black
            zIndex: 1000,
          }}
        />
      )}

      {isGameStarted ? (
        <Game onExitToMenu={handleExitToMenu} />
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

      {/* Add CSS for the fade-out animation */}
      <style>
        {`
          @keyframes fadeOut {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

export default App;