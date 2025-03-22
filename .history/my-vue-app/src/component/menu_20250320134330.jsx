import React, { useState } from "react";
import "./menustyle.css";

const Menu = ({ onStartGame }) => {
  const [menu, setMenu] = useState("main");

  console.log("Menu rendered, onStartGame prop:", onStartGame);

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

    if (originalText !== "Play") {
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
    <div className="menu-container">
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