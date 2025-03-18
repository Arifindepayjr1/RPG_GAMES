import React from 'react';
import Tilemap2 from './components/Tilemap2';

function App() {
  const customMap = [/* your custom map data */];
  return (
    <div className="App">
      <h1>Tilemap Test</h1>
      <Tilemap2 rawMap={customMap} />
    </div>
  );
}

export default App;