import React, { useState } from "react";
import Menu from "../src/component/";
import Tilemap1 from "./Tilemap1"; // Adjust path as needed

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    console.log("Starting game...");
    setGameStarted(true);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}>
      {!gameStarted ? (
        <Menu onStartGame={handleStartGame} />
      ) : (
        <Tilemap1 characterPos={{ x: 0, y: 0 }} onMapTransition={() => {}} />
      )}
    </div>
  );
};

export default App;