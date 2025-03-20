import React, { useRef, useEffect } from 'react';
import Character from './Character';
import { TILE_SIZE, TRANSITION_COOLDOWN, blockingBaseTiles, blockingItemIDs } from '../constants';

const Tilemap1 = () => {
  const canvasRef = useRef(null);
  const tilesetRef = useRef(new Image());
  let lastTransitionTime = 0;

  const rawMap = [
    [77, 77, 77, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 8, 5, 5, 5, 5, 8, 12, 21, '12/*itemID41*/', '12/*itemID42*/', '12/*itemID42*/', '12/*itemID43*/', 12, 13, 13],
    [77, 77, 2, 1, 1, 1, 2, 12, 12, 12, 12, 12, 12, 12, 12, 6, 57, 0, '0/*itemID56*/', '0/*itemID45*/', 6, 12, 21, 16, 16, 16, 16, 12, 13, 13],
    [12, 12, 2, 18, 18, 18, 2, 21, 12, 12, 12, 12, 12, 12, 12, 6, 0, 0, 0, 54, 6, 12, 21, 16, 51, 16, 16, 12, 13, 12],
    [77, 12, 2, 18, 36, 18, 2, 12, 21, 12, 12, 12, 12, 12, 12, 5, 5, 0, 5, 5, 5, 12, 12, 21, 19, 13, 59, 12, 12, 12],
    [77, 12, 2, 18, 18, 18, 2, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    [12, 12, 1, 1, 18, 1, 1, 13, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    [12, 12, 12, 12, 11, 12, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    [12, 12, 12, 12, 11, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    [60, 60, 60, 12, 11, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, '12/*itemID42*/', '12/*itemID42*/', '12/*itemID25*/', '12/*itemID26*/'],
    [60, 13, 13, 11, 11, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 31, 12, 12, '12/*itemID35*/', 12, 12, 12, 12],
    [60, 13, 13, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, '11/*itemID48*/', 11, 11, 11, 11, 11, 11, 12, 12, 12, '12/*itemID35*/', 12, 12, 12, 12],
    [60, 60, 60, 12, 11, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 31, 31, 12, 12, '12/*itemID43*/', 12, 12, 12, 12],
    [21, 12, 12, 12, 11, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, '12/*itemID25*/', '12/*itemID26*/', '12/*itemID26*/', 12, 12, 12, 12],
    [12, 12, 12, 12, 11, 12, 12, 13, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, '12/*itemID25*/', '12/*itemID35*/', 22, 22, 22, 22, 22, 22],
    [12, 12, 12, 12, 11, 12, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 12, 12, '12/*itemID41*/', '12/*itemID43*/', 22, '12/*itemID33*/', '12/*itemID43*/', 12, 12, 12],
    [11, 11, 11, 11, 11, 12, 12, 12, 12, '22/*itemID25*/', '22/*itemID26*/', '22/*itemID27*/', '12/*itemID42*/', '12/*itemID42*/', 11, '11/*itemID42*/', '11/*itemID42*/', '11/*itemID42*/', '11/*itemID42*/', '12/*itemID42*/', '12/*itemID42*/', '31/*itemID42*/', '16/*itemID42*/', '16/*itemID43*/', '22/*itemID33*/', '16/*itemID33*/', 16, 12, 12, 21],
    [12, 12, 12, 12, 12, 12, 12, 12, 12, '22/*itemID33*/', 22, 22, 22, 22, 11, 22, 22, 22, 22, 22, 22, 22, 22, 22, '22/*itemID43*/', 12, '12/*itemID35*/', 12, 12, 31],
    [12, 12, 12, 12, 12, 12, 12, 12, 12, '22/*itemID41*/', '22/*itemID42*/', '22/*itemID42*/', '22/*itemID43*/', 12, 11, '12/*itemID26*/', '12/*itemID26*/', '12/*itemID26*/', 31, 31, 31, 31, 31, '12/*itemID26*/', '12/*itemID26*/', 12, '12/*itemID35*/', 12, 12, 21],
    [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 11, 12, 12, 12, 12, 31, 31, 31, 31, 12, 12, 12, '12/*itemID35*/', 12, 12, 12],
    [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 51, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, '16/*itemID27*/', 21, 12]
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
    35: { x: 32, y: 64 },
    15: { x: 96, y: 16 }, 23: { x: 96, y: 32 }, 24: { x: 64, y: 32 }, 3: { x: 32, y: 0 },
    4: { x: 48, y: 0 }, 50: { x: 16, y: 96 }, 37: { x: 64, y: 64 }, 40: { x: 112, y: 64 },
    58: { x: 0, y: 112 }, 61: { x: 64, y: 112 }, 62: { x: 80, y: 112 }
  };

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    tilesetRef.current.src = '222.png';

    const commentRegex = /(\d+)\/\*itemID(\d+)\*/i;
    const map = Array(20).fill().map(() => Array(30));
    const overlayLayer = Array(20).fill().map(() => Array(30).fill(null));
    const secondOverlayLayer = Array(20).fill().map(() => Array(30).fill(null));

    for (let row = 0; row < rawMap.length; row++) {
      for (let col = 0; col < rawMap[row].length; col++) {
        const tile = rawMap[row][col];
        if (typeof tile === 'string' && commentRegex.test(tile)) {
          const [, baseId, itemId] = tile.match(commentRegex);
          map[row][col] = parseInt(baseId);
          overlayLayer[row][col] = parseInt(itemId);
        } else {
          map[row][col] = tile;
        }
        if (map[row][col] === 22) secondOverlayLayer[row][col] = 38;
      }
    }

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

      if (currentTime - lastTransitionTime < TRANSITION_COOLDOWN) return;

      if (tileY === 2 && tileX === 24) {
        window.location.href = 'tilemap2.html?spawnRow=4&spawnCol=12';
        lastTransitionTime = currentTime;
      } else if (tileY === 19 && tileX === 14) {
        window.location.href = 'tilemap3.html?spawnRow=8&spawnCol=3';
        lastTransitionTime = currentTime;
      }
    };

    const { updateCharacter, drawCharacter } = Character({
      ctx, map, overlayLayer, secondOverlayLayer, isWalkable, checkMapTransition, currentMap: 'tilemap1'
    });

    const drawMap = () => {
      if (!tilesetRef.current.complete) return;
      ctx.clearRect(0, 0, 960, 640);
      const grassPos = tilePositions[12];

      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 30; col++) {
          ctx.drawImage(tilesetRef.current, grassPos.x, grassPos.y, 16, 16, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
          const tileId = map[row][col];
          const tilePos = tilePositions[tileId];
          if (tilePos && tileId !== 12) {
            ctx.drawImage(tilesetRef.current, tilePos.x, tilePos.y, 16, 16, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }

      [overlayLayer, secondOverlayLayer].forEach(layer => {
        for (let row = 0; row < layer.length; row++) {
          for (let col = 0; col < layer[row].length; col++) {
            const tileId = layer[row][col];
            const tilePos = tilePositions[tileId];
            if (tilePos) {
              ctx.drawImage(tilesetRef.current, tilePos.x, tilePos.y, 16, 16, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
          }
        }
      });
    };

    const gameLoop = () => {
      updateCharacter();
      drawMap();
      drawCharacter();
      requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }, []);

  return <canvas ref={canvasRef} width={960} height={640} style={{ border: '1px solid white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'gray' }} />;
};

export default Tilemap1;