import React, { useState } from "react";
import Menu from "./Menu";
import Tilemap1 from "../src/component/";
import Tilemap2 from "./Tilemap2";
import Tilemap3 from "./Tilemap3";

const App = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentMap, setCurrentMap] = useState("tilemap1");
  const [characterPos, setCharacterPos] = useState({ x: 0, y: 15 * 32 }); // Default spawn for Tilemap1

  const handleMapTransition = (targetMap, newX, newY) => {
    setCurrentMap(targetMap);
    setCharacterPos({ x: newX, y: newY });
  };

  return (
    <div style={{ position: "relative", width: "960px", height: "640px", margin: "0 auto" }}>
      {!isGameStarted && <Menu onStartGame={() => setIsGameStarted(true)} />}
      {isGameStarted && currentMap === "tilemap1" && (
        <Tilemap1 characterPos={characterPos} onMapTransition={handleMapTransition} />
      )}
      {isGameStarted && currentMap === "tilemap2" && (
        <Tilemap2 characterPos={characterPos} onMapTransition={handleMapTransition} />
      )}
      {isGameStarted && currentMap === "tilemap3" && (
        <Tilemap3 characterPos={characterPos} onMapTransition={handleMapTransition} />
      )}
    </div>
  );
};

export default App;