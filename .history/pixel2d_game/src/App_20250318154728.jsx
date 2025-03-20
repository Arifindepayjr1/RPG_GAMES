import React, { useState } from "react";
import Menu from "../src/component/menu"; // Adjust path as needed
import Tilemap1 from "../src/component"; // Adjust path as needed

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