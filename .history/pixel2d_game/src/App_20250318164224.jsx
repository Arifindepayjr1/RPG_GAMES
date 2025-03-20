import React, { useState } from "react";
import Menu from "./component/menu";
import Tilemap1 from "./component/tilemap1";
import "./App.css";

const App = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);

  const handleStartGame = () => {
    console.log("handleStartGame called, setting isGameStarted to true");
    setIsGameStarted(true);
  };

  console.log("App rendering, isGameStarted:", isGameStarted);

  return (
    <div>
      {/* Fallback button to test transition */}
      {!isGameStarted && (
        <button
          onClick={handleStartGame}
          style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1000 }}
        >
          Force Start Game
        </button>
      )}
      {isGameStarted ? <Tilemap1 /> : <Menu onStartGame={handleStartGame} />}
    </div>
  );
};

export default App;