import React, { useState } from "react";
import Menu from "../src/component/menu";
import Tilemap1 from "../src/component/tilemap1";
import Tilemap2 from "../src/component/tilemap2";
import Tilemap3 from "../src/component/tilemap3";

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentMap, setCurrentMap] = useState("tilemap1");
  const [characterPos, setCharacterPos] = useState({ x: 5 * 32, y: 5 * 32 }); // Start in Tilemap1 at (160, 160)

  // Handler to start the game from the menu
  const handleStartGame = () => {
    console.log("Starting game...");
    setGameStarted(true);
  };

  // Handler for map transitions, ensuring smooth character repositioning
  const handleMapTransition = (mapName, x, y) => {
    console.log(`Transitioning to ${mapName} at x: ${x}, y: ${y}`);
    setCurrentMap(mapName);
    setCharacterPos({ x, y });
  };

  // Render the current tilemap based on the map state
  const renderMap = () => {
    const mapComponents = {
      tilemap1: Tilemap1,
      tilemap2: Tilemap2,
      tilemap3: Tilemap3,
    };

    const CurrentMapComponent = mapComponents[currentMap] || Tilemap1; // Fallback to Tilemap1 if map is invalid
    return <CurrentMapComponent characterPos={characterPos} onMapTransition={handleMapTransition} />;
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
        position: "relative", // Ensures child components align properly
      }}
    >
      {!gameStarted ? (
        <Menu onStartGame={handleStartGame} />
      ) : (
        renderMap()
      )}
    </div>
  );
};

export default App;