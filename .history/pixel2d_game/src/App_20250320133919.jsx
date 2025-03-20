import React, { useState } from "react";
import Menu from "../src/component/menu";
import Tilemap1 from "../src/component/tilemap1"; // Adjust path as needed

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    console.log("Starting game...");
    setGameStarted(true);
  };

  return (
    <div>
      {!gameStarted ? (
        <Menu onStartGame={handleStartGame} />
      ) : (
        <Tilemap1 characterPos={{ x: 0, y: 0 }} onMapTransition={() => {}} />
      )}
    </div>
  );
};

export default App;