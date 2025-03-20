// Tilemap1.jsx
import React, { useEffect, useRef } from "react";

const Tilemap1 = () => {
  const canvasRef = useRef(null);
  const TILE_SIZE = 16;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const tileset = new Image();
    tileset.src = ""; // Adjust path

    const rawMap = [
      [77, 77, 77, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 8, 5, 5, 5, 5, 8, 12, 21, '12/*itemID41*/', '12/*itemID42*/', '12/*itemID42*/', '12/*itemID43*/', 12, 13, 13],
      // ... (rest of your map data, unchanged)
      [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, '16/*itemID27*/', 21, 12]
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
      35: { x: 32, y: 64 }
    };

    const map = Array(20).fill().map(() => Array(30));
    const overlayLayer = Array(20).fill().map(() => Array(30).fill(null));
    const secondOverlayLayer = Array(20).fill().map(() => Array(30).fill(null));
    const commentRegex = /(\d+)\/\*itemID(\d+)\*/i;

    for (let row = 0; row < rawMap.length; row++) {
      for (let col = 0; col < rawMap[row].length; col++) {
        const tile = rawMap[row][col];
        if (typeof tile === "string" && commentRegex.test(tile)) {
          const [, baseId, itemId] = tile.match(commentRegex);
          map[row][col] = parseInt(baseId);
          overlayLayer[row][col] = parseInt(itemId);
        } else {
          map[row][col] = tile;
        }
        if (map[row][col] === 22) {
          secondOverlayLayer[row][col] = 38;
        }
      }
    }

    const drawMap = () => {
      if (!tileset.complete || tileset.naturalWidth === 0) {
        setTimeout(drawMap, 100);
        return;
      }

      const grassPos = tilePositions[12];
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 30; col++) {
          ctx.drawImage(tileset, grassPos.x, grassPos.y, TILE_SIZE, TILE_SIZE, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
          const tileId = map[row][col];
          const tilePos = tilePositions[tileId];
          if (tilePos && tileId !== 12) {
            ctx.drawImage(tileset, tilePos.x, tilePos.y, TILE_SIZE, TILE_SIZE, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }

      for (let row = 0; row < overlayLayer.length; row++) {
        for (let col = 0; col < overlayLayer[row].length; col++) {
          const tileId = overlayLayer[row][col];
          const tilePos = tilePositions[tileId];
          if (tilePos) {
            ctx.drawImage(tileset, tilePos.x, tilePos.y, TILE_SIZE, TILE_SIZE, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }

      for (let row = 0; row < secondOverlayLayer.length; row++) {
        for (let col = 0; col < secondOverlayLayer[row].length; col++) {
          const tileId = secondOverlayLayer[row][col];
          const tilePos = tilePositions[tileId];
          if (tilePos) {
            ctx.drawImage(tileset, tilePos.x, tilePos.y, TILE_SIZE, TILE_SIZE, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    };

    tileset.onload = drawMap;
    tileset.onerror = () => console.error("Failed to load tileset image");
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={320}
      style={{ border: "1px solid black" }}
    />
  );
};

export default Tilemap1;