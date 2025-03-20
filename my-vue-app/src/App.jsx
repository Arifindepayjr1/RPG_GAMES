// src/App.jsx
import React from 'react';
import Game from '../src/component/Game';

function App() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'gray' }}>
      <Game />
    </div>
  );
}

export default App;