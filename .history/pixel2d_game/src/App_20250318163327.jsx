import React, { useState } from "react";
import Menu from "./component/menu"; // Lowercase 'menu' matches your structure
import Tilemap1 from "./component/tilemap1"; // Lowercase 'tilemap1' matches your structure
import "./App.css"; // If you have styling for App

const App = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);

  const handleStartGame = () => {
    console.log("handleStartGame called, setting isGameStarted to true");
    setIsGameStarted(true);
  };

  console.log("App rendering, isGameStarted:", isGameStarted);

  return (
    <div>
      {isGameStarted ? <Tilemap1 /> : <Menu onStartGame={handleStartGame} />}
    </div>
  );
};

export default App;