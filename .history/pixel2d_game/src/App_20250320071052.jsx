import React, { lazy, Suspense } from 'react';

// Lazy load tilemap components
const Tilemap1 = lazy(() => import('./components/tilemap1.jsx'));
const Tilemap2 = lazy(() => import('./components/tilemap2.jsx'));
const Tilemap3 = lazy(() => import('./components/tilemap3.jsx'));

const App = () => {
  const getCurrentMap = () => {
    const pathname = window.location.pathname.toLowerCase();
    if (pathname.includes('tilemap2')) return 'tilemap2';
    if (pathname.includes('tilemap3')) return 'tilemap3';
    return 'tilemap1'; // Default
  };

  const currentMap = getCurrentMap();

  // Optional: Log for debugging
  console.log('Current map:', currentMap);

  return (
    <Suspense fallback={<div>Loading map...</div>}>
      {currentMap === 'tilemap1' && <Tilemap1 />}
      {currentMap === 'tilemap2' && <Tilemap2 />}
      {currentMap === 'tilemap3' && <Tilemap3 />}
    </Suspense>
  );
};

export default App;