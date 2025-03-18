import React, { useEffect, useRef } from 'react';
import tilemapImage from "./asset/assets/tilemap1asset.png";

const Tilemap2 = () => {
  const canvasRef = useRef(null);
  const TILE_SIZE = 32; // Output size on canvas (scaled up from 16x16 tiles)

  // Raw map data (tilemap2)
  const rawMap = [
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 16, 16, 16, 16, 16, 16,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 16, 16, 16, 16, 16, 16,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 16, 16, 16, 16, 16, 16,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 16, 16, 16, 16, 16, 16, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, '15/*itemID37*/', 15, 15, 15, 15, '15/*itemID37*/', 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 15, 15, 15, 15, 15, 15, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 4, 1, 1, 1, 1, 1, 1, 4, 23, 23, 23, 23, 23, 23, 15, 15, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 1, 1, '15/*itemID61*/', 15, 15, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 15, 15, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 15, 15, 15, 15, 15, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 15, 15, 23, 23, 23, 23, 23, 23, 16, 16, 16, 16, 16,
    23, 23, 1, 1, '15/*itemID61*/', 15, 15, 15, 15, 15, 2, 16, 16, 16, 16, 16, 16, 15, 15, 16, 16, 16, 16, 23, 23, 15, 15, 15, 15, 15,
    23, 23, 23, 2, 15, 15, 15, 15, 15, 15, 3, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 23, 23, 15, 15, 15, 15, 15,
    23, 23, 23, 2, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    23, 23, 23, 2, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 16, 23, 23, 23, 23, 23,
    23, 23, 23, 2, 15, 15, 15, 15, 15, 15, 2, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 3, 1, 1, 1, 1, 1, 1, 3, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 15, 15, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 15, 15, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23
  ];

  // Preprocess the map to separate base tiles and overlay items
  const baseLayer = Array(20).fill().map(() => Array(30));
  const overlayLayer = Array(20).fill().map(() => Array(30).fill(null));
  const commentRegex = /(\d+)\/\*itemID(\d+)\*/i;

  for (let i = 0; i < rawMap.length; i++) {
    const row = Math.floor(i / 30);
    const col = i % 30;
    const tile = rawMap[i];
    
    if (typeof tile === 'string' && commentRegex.test(tile)) {
      const [, baseId, itemId] = tile.match(commentRegex);
      baseLayer[row][col] = parseInt(baseId);
      overlayLayer[row][col] = parseInt(itemId);
    } else {
      baseLayer[row][col] = tile;
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const tileset = new Image();
    tileset.src = tilemapImage;

    // Disable image smoothing to prevent scaling artifacts
    ctx.imageSmoothingEnabled = false;

    const tilePositions = {
      12: { x: 48, y: 16 }, 11: { x: 32, y: 16 }, 18: { x: 16, y: 32 }, 22: { x: 80, y: 32 },
      0: { x: 0, y: 16 }, 5: { x: 64, y: 0 }, 8: { x: 112, y: 0 }, 6: { x: 80, y: 0 },
      1: { x: 0, y: 0 }, 2: { x: 16, y: 0 }, 89: { x: 0, y: 176 }, 13: { x: 64, y: 16 },
      77: { x: 64, y: 144 }, 31: { x: 96, y: 48 }, 59: { x: 32, y: 112 }, 60: { x: 48, y: 112 },
      21: { x: 64, y: 32 }, 28: { x: 48, y: 48 }, 57: { x: 112, y: 96 }, 56: { x: 96, y: 96 },
      45: { x: 80, y: 80 }, 54: { x: 80, y: 96 }, 48: { x: 112, y: 80 }, 38: { x: 80, y: 64 },
      36: { x: 64, y: 64 }, 16: { x: 112, y: 16 }, 51: { x: 32, y: 96 }, 19: { x: 32, y: 32 },
      41: { x: 0, y: 80 }, 42: { x: 16, y: 80 }, 43: { x: 32, y: 80 }, 33: { x: 0, y: 64 },
      25: { x: 0, y: 48 }, 26: { x: 16, y: 48 }, 27: { x: 32, y: 48 }, 35: { x: 32, y: 64 },
      // New tiles from tilemap2
      15: { x: 96, y: 16 },  // Grass (main ground)
      23: { x: 96, y: 32 },  // Tree/Wall
      24: { x: 64, y: 32 },  // Bush/Fence
      3: { x: 32, y: 0 },    // Wall corner bottom-left
      4: { x: 48, y: 0 },    // Wall corner top-left
      // Item IDs
      37: { x: 64, y: 64 },  // itemID37
      61: { x: 64, y: 112 }, // itemID61
      49: { x: 0, y: 96 }    // itemID49
    };

    const drawMap = () => {
      if (!tileset.complete || tileset.naturalWidth === 0) {
        console.log('Tileset not loaded yet, retrying...');
        setTimeout(drawMap, 100);
        return;
      }

      // Clear canvas to ensure no overlapping artifacts
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Step 1: Draw the base layer
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 30; col++) {
          const tileId = baseLayer[row][col];
          const tilePos = tilePositions[tileId] || tilePositions[15]; // Default to grass
          ctx.drawImage(
            tileset,
            tilePos.x, tilePos.y, // Source x, y
            16, 16,               // Source width, height (16x16 tiles)
            col * TILE_SIZE, row * TILE_SIZE, // Destination x, y (32x32 grid)
            TILE_SIZE, TILE_SIZE  // Destination width, height (scaled to 32x32)
          );
        }
      }

      // Step 2: Draw the overlay layer (items)
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 30; col++) {
          const tileId = overlayLayer[row][col];
          const tilePos = tilePositions[tileId];
          if (tilePos) {
            ctx.drawImage(
              tileset,
              tilePos.x, tilePos.y, // Source x, y
              16, 16,               // Source width, height
              col * TILE_SIZE, row * TILE_SIZE, // Destination x, y (scaled grid)
              TILE_SIZE, TILE_SIZE  // Destination width, height (32x32)
            );
          }
        }
      }
    };

    tileset.onload = drawMap;
    tileset.onerror = () => console.error('Failed to load tileset image');
  }, [baseLayer, overlayLayer]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={960}  // 30 tiles * 32px
        height={640} // 20 tiles * 32px
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          border: "1px solid white",
          background: "gray" // Fallback background
        }}
      />
    </div>
  );
};

export default Tilemap2;