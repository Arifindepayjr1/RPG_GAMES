// src/components/Menu.jsx
import React, { useState, useEffect, useRef } from "react";
import "./menustyle.css";

const Menu = ({ onStartGame, setSoundtrackRef }) => {
  const [menu, setMenu] = useState("main");
  const soundtrackRef = useRef(null);
  const hasInteractedRef = useRef(false);

  console.log("Menu rendered, onStartGame prop:", onStartGame);

  // Initialize and autoplay the soundtrack (muted) when the menu loads
  useEffect(() => {
    console.log("Initializing audio...");
    soundtrackRef.current = new Audio('../../public/jayz.mp3');
    console.log("Audio object created:", soundtrackRef.current);
    soundtrackRef.current.loop = true;
    soundtrackRef.current.volume = 0.5;
    soundtrackRef.current.muted = true; // Start muted to allow autoplay
    console.log("Audio settings: loop=true, volume=0.5, muted=true");

    // Pass the soundtrack ref to App.jsx
    if (setSoundtrackRef) {
      setSoundtrackRef(soundtrackRef.current);
      console.log("Soundtrack ref passed to App.jsx");
    }

    const playSoundtrack = () => {
      console.log("Attempting to play audio...");
      soundtrackRef.current.play()
        .then(() => {
          console.log('Menu soundtrack autoplay successful (muted)');
        })
        .catch(error => {
          console.error('Menu soundtrack autoplay failed:', error);
        });
    };

    soundtrackRef.current.addEventListener('canplaythrough', playSoundtrack);
    console.log("Added canplaythrough event listener");

    // Check for other audio events to debug
    soundtrackRef.current.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      console.error('Error code:', soundtrackRef.current.error?.code);
      console.error('Error message:', soundtrackRef.current.error?.message);
    });

    soundtrackRef.current.addEventListener('loadeddata', () => {
      console.log('Audio data loaded successfully');
    });

    return () => {
      console.log("Cleaning up audio...");
      soundtrackRef.current.removeEventListener('canplaythrough', playSoundtrack);
      soundtrackRef.current.pause();
      soundtrackRef.current = null;
    };
  }, [setSoundtrackRef]);

  // Unmute the audio on user interaction
  const handleUserInteraction = () => {
    if (!hasInteractedRef.current && soundtrackRef.current) {
      hasInteractedRef.current = true;
      console.log("User interacted, unmuting audio...");
      soundtrackRef.current.muted = false; // Unmute the audio
      console.log("Audio unmuted, current state:", {
        muted: soundtrackRef.current.muted,
        volume: soundtrackRef.current.volume,
        currentTime: soundtrackRef.current.currentTime,
      });
    }
  };

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

  return (
    <div className="menu-container" onClick={handleUserInteraction}>
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
    </div>
  );
};

export default Menu;