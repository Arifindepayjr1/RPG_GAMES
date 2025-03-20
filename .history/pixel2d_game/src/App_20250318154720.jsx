import React, { useState } from "react";
import Menu from "../src/component/"; // Adjust path as needed
import Tilemap1 from "./component/Tilemap1"; // Adjust path as needed

const App = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);

  const handleStartGame = () => {
    setIsGameStarted(true);
  };

  return (
    <div>
      {isGameStarted ? <Tilemap1 /> : <Menu onStartGame={handleStartGame} />}
    </div>
  );
};

export default App;