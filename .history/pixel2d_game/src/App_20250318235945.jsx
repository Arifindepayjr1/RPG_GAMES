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
     
    </div>
  );
};

export default App;