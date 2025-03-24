// src/components/Menu.jsx
import React, { useState, useEffect, useRef } from "react";
import "./menustyle.css";

const Menu = ({ onStartGame, setSoundtrackRef }) => {
  const [menu, setMenu] = useState("main");
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const soundtrackRef = useRef(null);

  console.log("Menu rendered, onStartGame prop:", onStartGame);

  // Initialize and autoplay the soundtrack when the menu loads
  useEffect(() => {
    soundtrackRef.current = new Audio('../../public/jayz.gif');
    soundtrackRef.current.loop = true;
    soundtrackRef.current.volume = 0.5;

    // Pass the soundtrack ref to App.jsx
    if (setSoundtrackRef) {
      setSoundtrackRef(soundtrackRef.current);
    }

    const playSoundtrack = () => {
      soundtrackRef.current.play()
        .then(() => {
          console.log('Menu soundtrack autoplay successful');
          setAutoplayFailed(false);
        })
        .catch(error => {
          console.error('Menu soundtrack autoplay failed:', error);
          setAutoplayFailed(true);
        });
    };

    soundtrackRef.current.addEventListener('canplaythrough', playSoundtrack);

    return () => {
      soundtrackRef.current.removeEventListener('canplaythrough', playSoundtrack);
      soundtrackRef.current.pause();
      soundtrackRef.current = null;
    };
  }, [setSoundtrackRef]);

  const changeText = (event) => {
    const element = event.target;
    const originalText = element.innerHTML;

    console.log("changeText called with:", originalText);

    switch (originalText) {
      case "New Game":
        element.innerHTML = "Loading New World...";
        break;
      case "Continue":
        element.innerHTML = "Resuming Dark Quest...";
        console.log("Continue clicked, calling onStartGame");
        if (onStartGame) onStartGame();
        break;
      case "Exit":
        element.innerHTML = "Escape is Imminent...";
        break;
      case "Play":
        element.innerHTML = "Entering the Abyss...";
        console.log("Play clicked, calling onStartGame");
        if (onStartGame) onStartGame();
        break;
      case "Options":
        element.innerHTML = "Adjusting Reality...";
        break;
      case "Credits":
        element.innerHTML = "Honoring the Creators...";
        break;
      default:
        element.innerHTML = "Game Over...";
    }

    if (originalText !== "Play" && originalText !== "Continue") {
      setTimeout(() => {
        element.innerHTML = originalText;
      }, 2000);
    }
  };

  const startNewGame = () => {
    console.log("startNewGame called, switching to newGame");
    setMenu("newGame");
  };

  const exitGame = () => {
    console.log("exitGame called, attempting to close window");
    window.close();
  };

  const handleEnableAudio = () => {
    if (autoplayFailed && soundtrackRef.current) {
      soundtrackRef.current.play()
        .then(() => {
          console.log('Menu soundtrack playing after user interaction');
          setAutoplayFailed(false);
        })
        .catch(error => {
          console.error('Error playing menu soundtrack after interaction:', error);
        });
    }
  };

  return (
    <div className="menu-container" onClick={handleEnableAudio}>
      {menu === "main" ? (
        <div className="main-menu">
          <h1 id="title">TREYVISAI</h1>
          <h2 className="game-menu" onClick={startNewGame}>
            New Game
          </h2>
          <h2 className="game-menu" onClick={changeText}>
            Continue
          </h2>
          <h2 className="game-menu" onClick={changeText}>
            Exit
          </h2>
          <p id="version">V 1.0.0</p>
        </div>
      ) : (
        <div className="main-menu">
          <h1 id="newTitle">TREYVISAI</h1>
          <h2 className="game-menu" onClick={changeText}>
            Play
          </h2>
          <h2 className="game-menu" onClick={changeText}>
            Options
          </h2>
          <h2 className="game-menu" onClick={changeText}>
            Credits
          </h2>
          <h2 className="game-menu" onClick={exitGame}>
            Exit
          </h2>
          <p id="version">V 1.0.0</p>
        </div>
      )}
      {autoplayFailed && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          Click anywhere to enable audio
        </div>
      )}
    </div>
  );
};

export default Menu;