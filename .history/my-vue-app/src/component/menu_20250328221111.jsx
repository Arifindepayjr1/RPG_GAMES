// src/components/Menu.jsx (for reference, unchanged)
import React, { useEffect, useRef, useState } from 'react';
import './menustyle.css';

const Menu = ({ onStartGame, setSoundtrackRef }) => {
  const [menuStage, setMenuStage] = useState('main');
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      setSoundtrackRef(audioRef.current);
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(error => {
        console.log('Autoplay prevented:', error);
      });
    }
  }, [setSoundtrackRef]);

  const handleNewGame = () => {
    setMenuStage('secondary');
  };

  const handleContinue = () => {
    console.log('Continue clicked');
  };

  const handleExit = () => {
    console.log('Exit clicked');
    window.close();
  };

  const handlePlay = () => {
    onStartGame();
  };

  const handleOptions = () => {
    console.log('Options clicked');
  };

  const handleCredits = () => {
    console.log('Credits clicked');
  };

  return (
    <div className="menu">
      <audio ref={audioRef} src="/jcole.mp3" loop />
      {menuStage === 'main' ? (
        <>
          <h1 className="menu-title">Rift Seeker</h1>
          <div className="menu-items">
            <div className="menu-item" onClick={handleNewGame}>
              New Game
            </div>
            <div className="menu-item" onClick={handleContinue}>
              Continue
            </div>
            <div className="menu-item" onClick={handleExit}>
              Exit
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="menu-title">Rift Seeker</h1>
          <div className="menu-items">
            <div className="menu-item" onClick={handlePlay}>
              Play
            </div>
            <div className="menu-item" onClick={handleOptions}>
              Options
            </div>
            <div className="menu-item" onClick={handleCredits}>
              Credits
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Menu;