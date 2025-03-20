import React, { useEffect, useRef, useMemo } from "react";
import tilemapImage from "./asset/assets/tilemap1asset.png";
import Character from "./Ccharacter";

const Tilemap3 = ({ characterPos, onMapTransition }) => {
  const canvasRef = useRef(null);
  const TILE_SIZE = 32;
  const MAP_WIDTH = 30 * TILE_SIZE;
  const MAP_HEIGHT = 20 * TILE_SIZE;

  const rawMap = [
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 16, 16, 16, 16, 16, 16],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 16, 16, 16, 16, 16, 16],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 16, 16, 16, 16, 16, 16],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 16, 16, 16, 16, 16, 16, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, '15/*itemID37*/', 15, 15, 15, 15, '15/*itemID37*/', 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 15, 15, 15, 15, 15, 15, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 4, 1, 1, 1, 1, 1, 1, 4, 23, 23, 23, 23, 23, 23, 15, 15, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 1, 1, '15/*itemID61*/', 15, 15, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 15, 15, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 15, 15, 15, 15, 15, 15, 15, 15, 2, 23, 23, 23, 23, 23, 23, 15, 15, 23, 23, 23, 23, 23, 23, 16, 16, 16, 16, 16],
    [23, 23, 1, 1, '15/*itemID61*/', 15, 15, 15, 15, 15, 2, 16, 16, 16, 16, 16, 16, 15, 15, 16, 16, 16, 16, 23, 23, 15, 15, 15, 15, 15],
    [23, 23, 23, 2, 15, 15, 15, 15, 15, 15, 3, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 23, 23, 15, 15, 15, 15, 15],
    [23, 23, 23, 2, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
    [23, 23, 23, 2, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 16, 23, 23, 23, 23, 23],
    [23, 23, 23, 2, 15, 15, 15, 15, 15, 15, 2, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 3, 1, 1, 1, 1, 1, 1, 3, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 15, 15, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 15, 15, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
    [23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23]
  ];

  const tilePositions = useMemo(() => ({
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
  }), []);

  const blockingBaseTiles = useMemo(() => [
    1, 2, 3, 4, 5, 6, 7, 8, 13, 16, 21, 22, 23, 31, 32, 36, 57, 59, 60, 77, 89
  ], []);

  const blockingItemIDs = useMemo(() => [
    25, 26, 27, 28, 33, 35, 37, 40, 41, 42, 43, 45, 46, 48, 49, 54, 55, 56, 58, 60, 61, 62, 77
  ], []);

  const preprocessMap = (rawMap) => {
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
        if (map[row][col] === 22) secondOverlayLayer[row][col] = 38;
      }
    }
    return { map, overlayLayer, secondOverlayLayer };
  };

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

      if (tileY === 9 && tileX === 11) {
        onMapTransition("tilemap1", 14 * TILE_SIZE, 18 * TILE_SIZE);
        window.lastTransitionTime = currentTime;
      }
    };

    const character = Character({
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

      const grassPos = tilePositions[15];
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
          if (tilePos && tileId !== 15) {
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

      character.render(ctx);
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

export default Tilemap3;