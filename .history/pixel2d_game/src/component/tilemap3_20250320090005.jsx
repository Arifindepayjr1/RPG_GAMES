import React, { useEffect, useRef, useState } from "react";
import tilemapImage from "./asset/assets/tilemap1asset.png"; // Adjust path
import spriteSheetImage from "./hero.png"; // Adjust path

const Tilemap3 = ({ characterPos }) => {
  const canvasRef = useRef(null);
  const TILE_SIZE = 32;
  const CHARACTER_DISPLAY_SIZE = 96;
  const CHARACTER_SPEED = 2;

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

  const [character, setCharacter] = useState({
    x: characterPos.x,
    y: characterPos.y,
    frameX: 0,
    frameY: 2,
    direction: "down",
    moving: false,
  });

  const keys = useRef({ w: false, s: false, a: false, d: false });

  const blockingBaseTiles = [1, 2, 3, 4, 5, 6, 7, 8, 13, 16, 21, 22, 23, 31, 32, 36, 57, 59, 60, 77, 89];
  const blockingItemIDs = [25, 26, 27, 28, 33, 35, 37, 40, 41, 42, 43, 45, 46, 48, 49, 54, 55, 56, 58, 60, 61, 62, 77];

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

  const updateCharacter = () => {
    let newX = character.x;
    let newY = character.y;
    let isMoving = false;

    if (keys.current.w) {
      newY -= CHARACTER_SPEED;
      setCharacter((prev) => ({ ...prev, direction: "up", frameY: 5 }));
      isMoving = true;
    }
    if (keys.current.s) {
      newY += CHARACTER_SPEED;
      setCharacter((prev) => ({ ...prev, direction: "down", frameY: 2 }));
      isMoving = true;
    }
    if (keys.current.a) {
      newX -= CHARACTER_SPEED;
      setCharacter((prev) => ({ ...prev, direction: "left", frameY: 4 }));
      isMoving = true;
    }
    if (keys.current.d) {
      newX += CHARACTER_SPEED;
      setCharacter((prev) => ({ ...prev, direction: "right", frameY: 3 }));
      isMoving = true;
    }

    if (isMoving && isWalkable(newX, newY)) {
      setCharacter((prev) => ({
        ...prev,
        x: newX,
        y: newY,
        moving: true,
        frameX: (prev.frameX + 1) % 4,
      }));
    } else {
      setCharacter((prev) => ({ ...prev, moving: false, frameX: 0 }));
    }
  };

  const draw = (ctx, tileset, spriteSheet) => {
    ctx.clearRect(0, 0, 960, 640);
    const grassPos = tilePositions[15];

    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 30; col++) {
        ctx.drawImage(tileset, grassPos.x, grassPos.y, 16, 16, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 30; col++) {
        const tileId = map[row][col];
        const tilePos = tilePositions[tileId];
        if (tilePos && tileId !== 15) {
          ctx.drawImage(tileset, tilePos.x, tilePos.y, 16, 16, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 30; col++) {
        const tileId = overlayLayer[row][col];
        const tilePos = tilePositions[tileId];
        if (tilePos) {
          ctx.drawImage(tileset, tilePos.x, tilePos.y, 16, 16, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 30; col++) {
        const tileId = secondOverlayLayer[row][col];
        const tilePos = tilePositions[tileId];
        if (tilePos) {
          ctx.drawImage(tileset, tilePos.x, tilePos.y, 16, 16, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    const srcX = character.frameX * 68 + 2;
    const srcY = character.frameY * 68 + 2;
    const offsetX = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;
    const offsetY = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;
    ctx.drawImage(
      spriteSheet,
      srcX, srcY, 64, 64,
      character.x + offsetX, character.y + offsetY,
      CHARACTER_DISPLAY_SIZE, CHARACTER_DISPLAY_SIZE
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const tileset = new Image();
    tileset.src = tilemapImage;
    const spriteSheet = new Image();
    spriteSheet.src = spriteSheetImage;

    let animationFrameId;

    const gameLoop = () => {
      if (tileset.complete && spriteSheet.complete) {
        updateCharacter();
        draw(ctx, tileset, spriteSheet);
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) keys.current[key] = true;
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) keys.current[key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [character]);

  return (
    <canvas
      ref={canvasRef}
      width={960}
      height={640}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        border: "1px solid white",
        background: "gray",
      }}
    />
  );
};

export default Tilemap3;