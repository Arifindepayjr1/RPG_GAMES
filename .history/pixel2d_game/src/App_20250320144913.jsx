import React, { useState } from "react";
import Menu from "../src/component/menu";
import Tilemap1 from "../src/component/tilemap1";
import Tilemap2 from "../src/component/tilemap2";
import Tilemap3 from "../src/component/tilemap3";

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentMap, setCurrentMap] = useState("tilemap1");
  const [characterPos, setCharacterPos] = useState({ x: 5 * 32, y: 5 * 32 }); // Start in Tilemap1

  const handleStartGame = () => {
    console.log("Starting game...");
    setGameStarted(true);
  };

  const handleMapTransition = (mapName, x, y) => {
    console.log(`Transitioning to ${mapName} at x: ${x}, y: ${y}`);
    setCurrentMap(mapName);
    setCharacterPos({ x, y });
  };

  const renderMap = () => {
    switch (currentMap) {
      case "tilemap1":
        return <Tilemap1 characterPos={characterPos} onMapTransition={handleMapTransition} />;
      case "tilemap2":
        return <Tilemap2 characterPos={characterPos} onMapTransition={handleMapTransition} />;
      case "tilemap3":
        return <Tilemap3 characterPos={characterPos} onMapTransition={handleMapTransition} />;
      default:
        return <Tilemap1 characterPos={characterPos} onMapTransition={handleMapTransition} />;
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        background: "black",
      }}
    >
      {!gameStarted ? <Menu onStartGame={handleStartGame} /> : renderMap()}
    </div>
  );
};

export default App;