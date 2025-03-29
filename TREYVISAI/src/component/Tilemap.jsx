// src/components/Tilemap.jsx
import { useEffect } from 'react';
import { tilePositions, TILE_SIZE } from '../data';

const Tilemap = ({ mapData, overlayData, secondOverlayData, canvasRef }) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const tileset = new Image();
    tileset.src = '/222.png';

    const draw = () => {
      if (!tileset.complete) return;

      // Draw grass layer
      const grassPos = tilePositions[12];
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 30; col++) {
          ctx.drawImage(
            tileset,
            grassPos.x, grassPos.y,
            16, 16,
            col * TILE_SIZE, row * TILE_SIZE,
            TILE_SIZE, TILE_SIZE
          );
        }
      }

      // Draw base tiles
      for (let row = 0; row < mapData.length; row++) {
        for (let col = 0; col < mapData[row].length; col++) {
          const tileId = mapData[row][col];
          const tilePos = tilePositions[tileId];
          if (tilePos && tileId !== 12) {
            ctx.drawImage(
              tileset,
              tilePos.x, tilePos.y,
              16, 16,
              col * TILE_SIZE, row * TILE_SIZE,
              TILE_SIZE, TILE_SIZE
            );
          }
        }
      }

      // Draw overlay layer
      for (let row = 0; row < overlayData.length; row++) {
        for (let col = 0; col < overlayData[row].length; col++) {
          const tileId = overlayData[row][col];
          const tilePos = tilePositions[tileId];
          if (tilePos) {
            ctx.drawImage(
              tileset,
              tilePos.x, tilePos.y,
              16, 16,
              col * TILE_SIZE, row * TILE_SIZE,
              TILE_SIZE, TILE_SIZE
            );
          }
        }
      }

      // Draw second overlay layer
      for (let row = 0; row < secondOverlayData.length; row++) {
        for (let col = 0; col < secondOverlayData[row].length; col++) {
          const tileId = secondOverlayData[row][col];
          const tilePos = tilePositions[tileId];
          if (tilePos) {
            ctx.drawImage(
              tileset,
              tilePos.x, tilePos.y,
              16, 16,
              col * TILE_SIZE, row * TILE_SIZE,
              TILE_SIZE, TILE_SIZE
            );
          }
        }
      }
    };

    tileset.onload = draw;
  }, [mapData, overlayData, secondOverlayData, canvasRef]);

  return null; // Tilemap doesn't render DOM elements, only draws on canvas
};

export default Tilemap;