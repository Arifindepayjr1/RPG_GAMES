import React from 'react';
import Tilemap1 from './components/Tilemap1';
import Tilemap2 from './components/Tilemap2';
import Tilemap3 from './components/Tilemap3';

const App = () => {
  const currentMap = window.location.pathname.includes('tilemap2') ? 'tilemap2' : 
                    window.location.pathname.includes('tilemap3') ? 'tilemap3' : 'tilemap1';

  return (
    <>
      {currentMap === 'tilemap1' && <Tilemap1 />}
      {currentMap === 'tilemap2' && <Tilemap2 />}
      {currentMap === 'tilemap3' && <Tilemap3 />}
    </>
  );
};

export default App;