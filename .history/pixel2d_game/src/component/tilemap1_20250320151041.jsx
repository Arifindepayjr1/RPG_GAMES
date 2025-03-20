import React, { useEffect, useRef, useMemo } from "react";
import tilemapImage from "./asset/assets/tilemap1asset.png";
import useCharacter from "./character"; // Import the hook

const Tilemap1 = ({ characterPos, onMapTransition }) => {
  const canvasRef = useRef(null);
  const TILE_SIZE = 32;
  const MAP_WIDTH = 30 * TILE_SIZE;
  const MAP_HEIGHT = 20 * TILE_SIZE;

  // ... (tilePositions, blockingBaseTiles, blockingItemIDs, rawMap, preprocessMap unchanged)

  const { map, overlayLayer, secondOverlayLayer } = preprocessMap(rawMap);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const scaleX = canvas.width / MAP_WIDTH;
    const scaleY = canvas.height / MAP_HEIGHT;
    const scale = Math.min(scaleX, scaleY, 1);
    const offsetX = (canvas.width - MAP_WIDTH * scale) / 2;
    const offsetY = (canvas.height - MAP_HEIGHT * scale) / 2;

    const tileset = new Image();
    tileset.src = tilemapImage;

    const isWalkable = (x, y) => {
      const tileX = Math.floor(x / TILE_SIZE);
      const tileY = Math.floor(y / TILE_SIZE);
      if (tileX < 0 || tileX >= 30 || tileY < 0 || tileY >= 20) return false;

      const baseTile = map[tileY][tileX];
      const overlayTile = overlayLayer[tileY][tileX];
      const secondOverlayTile = secondOverlayLayer[tileY][tileX];

      return !(
        blockingBaseTiles.includes(baseTile) ||
        (overlayTile && blockingItemIDs.includes(overlayTile)) ||
        (secondOverlayTile && blockingItemIDs.includes(secondOverlayTile))
      );
    };

    const checkMapTransition = (position) => {
      const tileX = Math.floor(position.x / TILE_SIZE);
      const tileY = Math.floor(position.y / TILE_SIZE);
      const currentTime = Date.now();
      const lastTransitionTime = window.lastTransitionTime || 0;

      if (currentTime - lastTransitionTime < 1000) return;

      if (tileY === 2 && tileX === 24) {
        onMapTransition("tilemap2", 12 * TILE_SIZE, 4 * TILE_SIZE);
        window.lastTransitionTime = currentTime;
      } else if (tileY === 19 && tileX === 14) {
        onMapTransition("tilemap3", 3 * TILE_SIZE, 8 * TILE_SIZE);
        window.lastTransitionTime = currentTime;
      }
    };

    // Use the custom hook
    const character = useCharacter({
      initialPos: characterPos,
      onPositionUpdate: checkMapTransition,
      isWalkable,
      scale,
      offsetX,
      offsetY,
    });

    let animationFrameId;

    const draw = () => {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const grassPos = tilePositions[12];
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 30; col++) {
          ctx.drawImage(
            tileset,
            grassPos.x,
            grassPos.y,
            16,
            16,
            offsetX + col * TILE_SIZE * scale,
            offsetY + row * TILE_SIZE * scale,
            TILE_SIZE * scale,
            TILE_SIZE * scale
          );
        }
      }

      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 30; col++) {
          const tileId = map[row][col];
          const tilePos = tilePositions[tileId];
          if (tilePos && tileId !== 12) {
            ctx.drawImage(
              tileset,
              tilePos.x,
              tilePos.y,
              16,
              16,
              offsetX + col * TILE_SIZE * scale,
              offsetY + row * TILE_SIZE * scale,
              TILE_SIZE * scale,
              TILE_SIZE * scale
            );
          }
        }
      }

      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 30; col++) {
          const tileId = overlayLayer[row][col];
          const tilePos = tilePositions[tileId];
          if (tilePos) {
            ctx.drawImage(
              tileset,
              tilePos.x,
              tilePos.y,
              16,
              16,
              offsetX + col * TILE_SIZE * scale,
              offsetY + row * TILE_SIZE * scale,
              TILE_SIZE * scale,
              TILE_SIZE * scale
            );
          }
        }
      }

      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 30; col++) {
          const tileId = secondOverlayLayer[row][col];
          const tilePos = tilePositions[tileId];
          if (tilePos) {
            ctx.drawImage(
              tileset,
              tilePos.x,
              tilePos.y,
              16,
              16,
              offsetX + col * TILE_SIZE * scale,
              offsetY + row * TILE_SIZE * scale,
              TILE_SIZE * scale,
              TILE_SIZE * scale
            );
          }
        }
      }

      character.render(ctx); // Call the render function from the hook
    };

    const gameLoop = () => {
      if (tileset.complete) {
        draw();
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [characterPos, onMapTransition, blockingBaseTiles, blockingItemIDs, map, overlayLayer, secondOverlayLayer, tilePositions]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    />
  );
};

export default Tilemap1;