import React, { useState } from "react";
import "./menustyle.css";

const Menu = ({ onStartGame }) => {
  const [menu, setMenu] = useState("main");

  const changeText = (event) => {
    const element = event.target;
    const originalText = element.innerHTML;

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
    setMenu("newGame");
  };

  const exitGame = () => {
    window.close();
  };

  return (
    <div>
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
        </div>
      )}
      <p id="version">V 1.0.0</p>
    </div>
  );
};

export default Menu;