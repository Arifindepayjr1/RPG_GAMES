import React, { useEffect, useRef, useState, useMemo } from "react";
import tilemapImage from "./asset/assets/tilemap1asset.png"; // Adjust path
import spriteSheetImage from "../component/asset/assets/hero.png"; // Adjust path

const Tilemap1 = ({ characterPos, onMapTransition }) => {
  const canvasRef = useRef(null);
  const TILE_SIZE = 32;
  const CHARACTER_DISPLAY_SIZE = 96;
  const CHARACTER_SPEED = 1.5; // Reduced from 2

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

  const rawMap = [
    [77, 77, 77, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 8, 5, 5, 5, 5, 8, 12, 21, '12/*itemID41*/', '12/*itemID42*/', '12/*itemID42*/', '12/*itemID43*/', 12, 13, 13],
    [77, 77, 2, 1, 1, 1, 2, 12, 12, 12, 12, 12, 12, 12, 12, 6, '0/*itemID57*/', 0, '0/*itemID56*/', '0/*itemID45*/', 6, 12, 12, 16, 16, 16, 16, 12, 13, 13],
    [12, 28, 2, 18, 18, 18, 2, 21, 12, 12, 12, 12, 12, 12, 12, 6, 0, 0, 0, '0/*itemID54*/', 6, 12, 12, 16, 51, 16, 16, 12, 13, 12],
    [77, 12, 2, 18, '18/*itemID36*/', 18, 2, 12, 21, 12, 12, 12, 12, 12, 12, 5, 5, 5, 0, 5, 5, 12, 13, 12, 19, 13, 59, 12, 12, 12],
    [77, 12, 2, 18, 18, 18, 2, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 11, 28, 28, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    [12, 12, 1, 1, 49, 1, 1, 13, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    [12, 12, 12, 12, 11, 12, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    [12, 12, 12, 12, 11, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    [60, 60, 60, 12, 11, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, '12/*itemID42*/', '12/*itemID42*/', '12/*itemID25*/', '12/*itemID26*/'],
    [60, 13, 13, 11, 11, 12, 12, 12, 39, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 31, 12, 59, '12/*itemID35*/', 12, 12, 12, 12],
    [60, 13, 13, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, '11/*itemID48*/', 11, 11, 11, 11, 11, 11, 12, 12, 12, '12/*itemID35*/', 12, 12, 11, 12],
    [60, 60, 60, 12, 11, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 31, 31, 12, 12, '12/*itemID43*/', 12, 12, 12, 12],
    [21, 12, 12, 12, 11, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, '12/*itemID25*/', '12/*itemID26*/', '12/*itemID26*/', 12, 12, 12, 12],
    [12, 12, 12, 12, 11, 11, 12, 13, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, '12/*itemID25*/', '12/*itemID35*/', 22, 22, 22, 22, 22, 22],
    [12, 12, 12, 12, 11, 12, 12, 12, 12, '22/*itemID25*/', '22/*itemID26*/', '22/*itemID27*/', '12/*itemID42*/', '12/*itemID42*/', 11, '11/*itemID42*/', '11/*itemID42*/', '11/*itemID42*/', '11/*itemID42*/', '12/*itemID42*/', '12/*itemID42*/', '31/*itemID42*/', '16/*itemID42*/', '16/*itemID43*/', '22/*itemID33*/', '16/*itemID33*/', 16, 12, 12, 21],
    [11, 11, 11, 11, 11, 12, 12, 12, 12, '22/*itemID33*/', 22, 22, 22, 22, 89, 22, 22, 22, 22, 22, 22, 22, 22, 22, '22/*itemID43*/', 12, '12/*itemID35*/', 12, 12, 13],
    [12, 12, 12, 12, 12, 12, 12, 12, 12, '22/*itemID41*/', '22/*itemID42*/', '22/*itemID42*/', '22/*itemID43*/', 12, 11, '12/*itemID26*/', '12/*itemID26*/', '12/*itemID26*/', '31/*itemID26*/', '31/*itemID26*/', '31/*itemID26*/', '31/*itemID26*/', '31/*itemID26*/', '12/*itemID26*/', '12/*itemID26*/', 12, '12/*itemID35*/', 12, 12, 21],
    [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 11, 12, 12, 12, 12, 31, 31, 31, 31, 12, 12, 12, '12/*itemID35*/', 12, 12, 12],
    [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 11, 12, 12, 12, 12, 31, 31, 31, 31, 12, 12, 12, '12/*itemID35*/', 12, 12, 12],
    [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, '16/*itemID27*/', 21, 12]
  ];

  const [character, setCharacter] = useState({
    x: characterPos.x,
    y: characterPos.y,
    targetX: characterPos.x,
    targetY: characterPos.y,
    frameX: 0,
    frameY: 2, // Facing down
    direction: "down",
    moving: false,
    lastFrameTime: 0,
  });

  const keys = useRef({ w: false, s: false, a: false, d: false });
  const lastTransitionTime = useRef(0);

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

    // Set canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const scaleX = canvas.width / (30 * TILE_SIZE);
    const scaleY = canvas.height / (20 * TILE_SIZE);
    const scale = Math.min(scaleX, scaleY);

    const tileset = new Image();
    tileset.src = tilemapImage;
    const spriteSheet = new Image();
    spriteSheet.src = spriteSheetImage;

    let animationFrameId;
    let lastTime = 0;
    const FRAME_DURATION = 150; // Slower animation (150ms per frame)

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

    const checkMapTransition = () => {
      const tileX = Math.floor(character.x / TILE_SIZE);
      const tileY = Math.floor(character.y / TILE_SIZE);
      const currentTime = Date.now();

      if (currentTime - lastTransitionTime.current < 1000) return;

      if (tileY === 2 && tileX === 24) {
        onMapTransition("tilemap2", 12 * TILE_SIZE, 4 * TILE_SIZE);
        lastTransitionTime.current = currentTime;
      } else if (tileY === 19 && tileX === 14) {
        onMapTransition("tilemap3", 3 * TILE_SIZE, 8 * TILE_SIZE);
        lastTransitionTime.current = currentTime;
      }
    };

    const updateCharacter = (deltaTime) => {
      let direction = character.direction;
      let isMoving = false;

      if (keys.current.w) {
        direction = "up";
        isMoving = true;
      } else if (keys.current.s) {
        direction = "down";
        isMoving = true;
      } else if (keys.current.a) {
        direction = "left";
        isMoving = true;
      } else if (keys.current.d) {
        direction = "right";
        isMoving = true;
      }

      const frameY = { up: 5, down: 2, left: 4, right: 3 }[direction];
      let targetX = character.targetX;
      let targetY = character.targetY;

      if (isMoving) {
        const speed = CHARACTER_SPEED * deltaTime * 60; // Normalize to 60 FPS
        if (direction === "up") targetY -= speed;
        if (direction === "down") targetY += speed;
        if (direction === "left") targetX -= speed;
        if (direction === "right") targetX += speed;

        if (isWalkable(targetX, targetY)) {
          setCharacter((prev) => ({
            ...prev,
            targetX,
            targetY,
            direction,
            frameY,
            moving: true,
          }));
        } else {
          isMoving = false;
        }
      }

      // Smoothly interpolate position
      const lerp = (start, end, t) => start + (end - start) * Math.min(t, 1);
      const newX = lerp(character.x, character.targetX, deltaTime * 10);
      const newY = lerp(character.y, character.targetY, deltaTime * 10);

      // Update frame only if moving
      let frameX = character.frameX;
      let lastFrameTime = character.lastFrameTime;
      if (isMoving && (performance.now() - lastFrameTime > FRAME_DURATION)) {
        frameX = (frameX + 1) % 4;
        lastFrameTime = performance.now();
      } else if (!isMoving) {
        frameX = 0;
      }

      setCharacter((prev) => ({
        ...prev,
        x: newX,
        y: newY,
        frameX,
        lastFrameTime,
        moving: isMoving,
      }));

      checkMapTransition();
    };

    const draw = (ctx, tileset, spriteSheet) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const grassPos = tilePositions[12];
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 30; col++) {
          ctx.drawImage(
            tileset,
            grassPos.x,
            grassPos.y,
            16,
            16,
            col * TILE_SIZE * scale,
            row * TILE_SIZE * scale,
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
              col * TILE_SIZE * scale,
              row * TILE_SIZE * scale,
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
              col * TILE_SIZE * scale,
              row * TILE_SIZE * scale,
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
              col * TILE_SIZE * scale,
              row * TILE_SIZE * scale,
              TILE_SIZE * scale,
              TILE_SIZE * scale
            );
          }
        }
      }

      const srcX = character.frameX * 68 + 2;
      const srcY = character.frameY * 68 + 2;
      const offsetX = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2 * scale;
      const offsetY = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2 * scale;
      ctx.drawImage(
        spriteSheet,
        srcX,
        srcY,
        64,
        64,
        character.x * scale + offsetX,
        character.y * scale + offsetY,
        CHARACTER_DISPLAY_SIZE * scale,
        CHARACTER_DISPLAY_SIZE * scale
      );
    };

    const gameLoop = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds
      lastTime = timestamp;

      if (tileset.complete && spriteSheet.complete) {
        updateCharacter(deltaTime);
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
    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [character, onMapTransition, characterPos, blockingBaseTiles, blockingItemIDs, map, overlayLayer, secondOverlayLayer, tilePositions]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "gray",
      }}
    />
  );
};

export default Tilemap1;