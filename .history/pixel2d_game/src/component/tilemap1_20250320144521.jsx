import React, { useEffect, useRef, useState, useMemo } from "react";
import tilemapImage from "./asset/assets/tilemap1asset.png";
import spriteSheetImage from "../component/asset/assets/hero.png";

const Tilemap1 = ({ characterPos, onMapTransition }) => {
  const canvasRef = useRef(null);
  const TILE_SIZE = 32;
  const MAP_WIDTH = 30 * TILE_SIZE;
  const MAP_HEIGHT = 20 * TILE_SIZE;
  const CHARACTER_DISPLAY_SIZE = 96;
  const CHARACTER_SPEED = 128; // Pixels per second (was 4 per frame, adjusted for deltaTime)

  // Same tilePositions, blockingBaseTiles, blockingItemIDs, and rawMap as before
  const tilePositions = useMemo(() => ({
    12: { x: 48, y: 16 }, 11: { x: 32, y: 16 }, /* ... rest unchanged ... */
  }), []);

  const blockingBaseTiles = useMemo(() => [
    1, 2, 3, 4, 5, 6, 7, 8, 13, 16, 21, 22, 23, 31, 32, 36, 57, 59, 60, 77, 89
  ], []);

  const blockingItemIDs = useMemo(() => [
    25, 26, 27, 28, 33, 35, 37, 40, 41, 42, 43, 45, 46, 48, 49, 54, 55, 56, 58, 60, 61, 62, 77
  ], []);

  const rawMap = [ /* unchanged */ ];

  const [character, setCharacter] = useState({
    x: characterPos.x,
    y: characterPos.y,
    frameX: 0,
    frameY: 2, // Facing down
    direction: "down",
    moving: false,
    lastFrameTime: 0,
  });

  const keys = useRef({ w: false, s: false, a: false, d: false });
  const lastTransitionTime = useRef(0);

  const preprocessMap = (rawMap) => { /* unchanged */ };
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
    const spriteSheet = new Image();
    spriteSheet.src = spriteSheetImage;

    let animationFrameId;
    let lastTime = 0;
    const FRAME_DURATION = 150; // Milliseconds per animation frame

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

    const checkMapTransition = () => { /* unchanged */ };

    const updateCharacter = (deltaTime) => {
      let direction = character.direction;
      let isMoving = false;
      let velocityX = 0;
      let velocityY = 0;

      // Determine direction and velocity based on key input
      if (keys.current.w) {
        direction = "up";
        velocityY = -CHARACTER_SPEED;
        isMoving = true;
      } else if (keys.current.s) {
        direction = "down";
        velocityY = CHARACTER_SPEED;
        isMoving = true;
      }
      if (keys.current.a) {
        direction = "left";
        velocityX = -CHARACTER_SPEED;
        isMoving = true;
      } else if (keys.current.d) {
        direction = "right";
        velocityX = CHARACTER_SPEED;
        isMoving = true;
      }

      const frameY = { up: 5, down: 2, left: 4, right: 3 }[direction];

      // Calculate new position with deltaTime for frame-rate independence
      const newX = character.x + velocityX * deltaTime;
      const newY = character.y + velocityY * deltaTime;

      // Collision detection: Check new position
      let nextX = character.x;
      let nextY = character.y;
      if (isWalkable(newX, character.y)) nextX = newX;
      if (isWalkable(character.x, newY)) nextY = newY;

      // Animation handling
      let frameX = character.frameX;
      let lastFrameTime = character.lastFrameTime;
      if (isMoving && performance.now() - lastFrameTime > FRAME_DURATION) {
        frameX = (frameX + 1) % 4;
        lastFrameTime = performance.now();
      } else if (!isMoving) {
        frameX = 0;
      }

      // Update character state
      setCharacter((prev) => ({
        ...prev,
        x: nextX,
        y: nextY,
        frameX,
        frameY,
        direction,
        moving: isMoving,
        lastFrameTime,
      }));

      checkMapTransition();
    };

    const draw = (ctx, tileset, spriteSheet) => { /* unchanged */ };

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