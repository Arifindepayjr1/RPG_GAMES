import React, { useEffect, useRef, useMemo } from 'react';
import tilemapImage from "./asset/assets/tilemap1asset.png";

const Tilemap3 = () => {
  const canvasRef = useRef(null);
  const TILE_SIZE = 16;

const rawMap = [
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 4, 49, 1, 4, 1, 1, 1, 4, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 15, 2, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 15, 2, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 15, 2, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 11, 22, 1, 50, 3, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 15, 15, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 15, 15, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 15, 15, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 3, 1, 4, 15, 15, 4, 1, 3, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 15, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23
  ];

  const baseLayer = Array(20).fill().map(() => Array(30));
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 30; col++) {
      baseLayer[row][col] = rawMap[row * 30 + col];
    }
  }

  // Memoize objects
  const objects = useMemo(() => [
    {"gid": 37, "height": 16, "id": 2, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 239.75, "y": 81},
    {"gid": 57, "height": 16, "id": 3, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 208.25, "y": 80.5},
    {"gid": 40, "height": 16, "id": 7, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 208, "y": 128},
    {"gid": 61, "height": 16, "id": 8, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 224.75, "y": 139.75},
    {"gid": 58, "height": 16, "id": 10, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 191.25, "y": 176.25},
    {"gid": 40, "height": 16, "id": 11, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 208.25, "y": 176.25},
    {"gid": 62, "height": 16, "id": 12, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 256.5, "y": 176.5},
    {"gid": 28, "height": 16, "id": 14, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 273, "y": 113.25}
  ], []); // Empty dependency array since it’s static

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const tileset = new Image();
    tileset.src = tilemapImage;

    const tilePositions = {
      12: { x: 48, y: 16 }, 11: { x: 32, y: 16 }, 18: { x: 16, y: 32 }, 22: { x: 80, y: 32 },
      0: { x: 0, y: 16 }, 5: { x: 64, y: 0 }, 8: { x: 112, y: 0 }, 6: { x: 80, y: 0 },
      1: { x: 0, y: 0 }, 2: { x: 16, y: 0 }, 89: { x: 0, y: 176 }, 13: { x: 64, y: 16 },
      77: { x: 64, y: 144 }, 31: { x: 96, y: 48 }, 59: { x: 32, y: 112 }, 60: { x: 48, y: 112 },
      21: { x: 64, y: 32 }, 28: { x: 48, y: 48 }, 57: { x: 112, y: 96 }, 56: { x: 96, y: 96 },
      45: { x: 80, y: 80 }, 54: { x: 80, y: 96 }, 48: { x: 112, y: 80 }, 38: { x: 80, y: 64 },
      36: { x: 64, y: 64 }, 16: { x: 112, y: 16 }, 51: { x: 32, y: 96 }, 19: { x: 32, y: 32 },
      49: { x: 0, y: 96 }, 41: { x: 0, y: 80 }, 42: { x: 16, y: 80 }, 43: { x: 32, y: 80 },
      33: { x: 0, y: 64 }, 25: { x: 0, y: 48 }, 26: { x: 16, y: 48 }, 27: { x: 32, y: 48 },
      35: { x: 32, y: 64 }, 15: { x: 96, y: 16 }, 23: { x: 96, y: 32 }, 24: { x: 64, y: 32 },
      3: { x: 32, y: 0 }, 4: { x: 48, y: 0 }, 50: { x: 16, y: 96 }, 37: { x: 64, y: 64 },
      40: { x: 112, y: 64 }, 58: { x: 0, y: 112 }, 61: { x: 64, y: 112 }, 62: { x: 80, y: 112 }
    };

    const drawMap = () => {
      if (!tileset.complete || tileset.naturalWidth === 0) {
        console.log('Tileset not loaded yet, retrying...');
        setTimeout(drawMap, 100);
        return;
      }

      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 30; col++) {
          const tileId = baseLayer[row][col];
          const tilePos = tilePositions[tileId] || tilePositions[15];
          ctx.drawImage(
            tileset,
            tilePos.x, tilePos.y,
            TILE_SIZE, TILE_SIZE,
            col * TILE_SIZE, row * TILE_SIZE,
            TILE_SIZE, TILE_SIZE
          );
        }
      }

      objects.forEach(obj => {
        if (obj.visible) {
          const tilePos = tilePositions[obj.gid];
          if (tilePos) {
            const x = Math.floor(obj.x / TILE_SIZE) * TILE_SIZE + (obj.x % TILE_SIZE);
            const y = Math.floor(obj.y / TILE_SIZE) * TILE_SIZE + (obj.y % TILE_SIZE);
            ctx.drawImage(
              tileset,
              tilePos.x, tilePos.y,
              TILE_SIZE, TILE_SIZE,
              x, y,
              TILE_SIZE, TILE_SIZE
            );
          }
        }
      });
    };

    tileset.onload = drawMap;
    tileset.onerror = () => console.error('Failed to load tileset image');

    return () => {};
  }, [baseLayer, objects]);

  return (
    <div>
      <canvas ref={canvasRef} width={480} height={320} style={{ border: '1px solid black' }} />
    </div>
  );
};

export default Tilemap3;