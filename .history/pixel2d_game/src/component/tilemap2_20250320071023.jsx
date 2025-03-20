import React, { useRef, useEffect } from 'react';
import Character from './character.jsx';
import { TILE_SIZE, TRANSITION_COOLDOWN, blockingBaseTiles, blockingItemIDs } from '../constants.js';

const Tilemap2 = () => {
  const canvasRef = useRef(null);
  const tilesetRef = useRef(new Image());
  const lastTransitionTime = useRef(0);

  const rawMap = [
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 4, 49, 1, 4, 1, 1, 1, 4, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 15, 2, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 15, 2, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 15, 2, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 15, 3, 1, 50, 3, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 15, 15, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 15, 15, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 15, 15, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 3, 1, 4, 15, 15, 4, 1, 3, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 2, 15, 15, 2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23,16,16,23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23]
  ];

  const objects = [
    {"gid": 37, "height": 16, "id": 2, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 239.75, "y": 81},
    {"gid": 57, "height": 16, "id": 3, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 208.25, "y": 80.5},
    {"gid": 40, "height": 16, "id": 7, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 208, "y": 128},
    {"gid": 61, "height": 16, "id": 8, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 224.75, "y": 139.75},
    {"gid": 58, "height": 16, "id": 10, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 191.25, "y": 176.25},
    {"gid": 40, "height": 16, "id": 11, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 208.25, "y": 176.25},
    {"gid": 62, "height": 16, "id": 12, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 256.5, "y": 176.5},
    {"gid": 28, "height": 16, "id": 14, "name": "", "rotation": 0, "type": "", "visible": true, "width": 16, "x": 273, "y": 113.25}
  ];

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

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    tilesetRef.current.src = "./asset/assets/tilemap1.png";

    const map = Array(20).fill().map(() => Array(30));
    const overlayLayer = Array(20).fill().map(() => Array(30).fill(null));
    const secondOverlayLayer = Array(20).fill().map(() => Array(30).fill(null));

    for (let row = 0; row < rawMap.length; row++) {
      for (let col = 0; col < rawMap[row].length; col++) {
        map[row][col] = rawMap[row][col];
      }
    }

    objects.forEach(obj => {
      if (obj.visible) {
        const tileX = Math.floor(obj.x / 16);
        const tileY = Math.floor(obj.y / 16);
        if (tileX >= 0 && tileX < 30 && tileY >= 0 && tileY < 20) {
          overlayLayer[tileY][tileX] = obj.gid;
        }
      }
    });

    const isWalkable = (x, y) => {
      const tileX = Math.floor(x / TILE_SIZE);
      const tileY = Math.floor(y / TILE_SIZE);
      if (tileX < 0 || tileX >= 30 || tileY < 0 || tileY >= 20) return false;

      const baseTile = map[tileY][tileX];
      const overlayTile = overlayLayer[tileY][tileX];
      const secondOverlayTile = secondOverlayLayer[tileY][tileX];
      return !(blockingBaseTiles.includes(baseTile) || (overlayTile && blockingItemIDs.includes(overlayTile)) || (secondOverlayTile && blockingItemIDs.includes(secondOverlayTile)));
    };

    const checkMapTransition = (x, y) => {
      const tileX = Math.floor(x / TILE_SIZE);
      const tileY = Math.floor(y / TILE_SIZE);
      const currentTime = Date.now();

      if (currentTime - lastTransitionTime.current < TRANSITION_COOLDOWN) return;

      if (tileY === 3 && tileX === 12) {
        window.location.href = 'index.html?spawnRow=3&spawnCol=24';
        lastTransitionTime.current = currentTime;
      }
    };

    const { updateCharacter, drawCharacter } = Character({
      ctx, map, overlayLayer, secondOverlayLayer, isWalkable, checkMapTransition, currentMap: 'tilemap2'
    });

    const drawMap = () => {
      if (!tilesetRef.current.complete) return;
      ctx.clearRect(0, 0, 960, 640);
      const grassPos = tilePositions[15];

      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 30; col++) {
          ctx.drawImage(tilesetRef.current, grassPos.x, grassPos.y, 16, 16, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
          const tileId = map[row][col];
          const tilePos = tilePositions[tileId] || tilePositions[15];
          if (tileId !== 15) {
            ctx.drawImage(tilesetRef.current, tilePos.x, tilePos.y, 16, 16, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }

      for (let row = 0; row < overlayLayer.length; row++) {
        for (let col = 0; col < overlayLayer[row].length; col++) {
          const tileId = overlayLayer[row][col];
          const tilePos = tilePositions[tileId];
          if (tilePos) {
            ctx.drawImage(tilesetRef.current, tilePos.x, tilePos.y, 16, 16, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    };

    const gameLoop = () => {
      updateCharacter();
      drawMap();
      drawCharacter();
      requestAnimationFrame(gameLoop);
    };
    gameLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array means run once on mount

  return <canvas ref={canvasRef} width={960} height={640} style={{ border: '1px solid white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'gray' }} />;
};

export default Tilemap2;