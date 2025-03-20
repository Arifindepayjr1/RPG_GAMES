import { useState, useRef, useEffect } from "react";
import spriteSheetImage from "./asset/assets/hero.png";

const useCharacter = ({ initialPos, onPositionUpdate, isWalkable, scale, offsetX, offsetY }) => {
  const CHARACTER_DISPLAY_SIZE = 96;
  const CHARACTER_SPEED = 256; // Faster speed for snappy movement
  const FRAME_DURATION = 100; // Faster animation

  const [character, setCharacter] = useState({
    x: initialPos.x,
    y: initialPos.y,
    frameX: 0,
    frameY: 2, // Facing down
    direction: "down",
    moving: false,
    lastFrameTime: 0,
  });

  const keys = useRef({ w: false, s: false, a: false, d: false });
  const spriteSheet = useRef(new Image());

  useEffect(() => {
    spriteSheet.current.src = spriteSheetImage;

    let animationFrameId;
    let lastTime = 0;

    const updateCharacter = (deltaTime) => {
      let direction = character.direction;
      let isMoving = false;
      let velocityX = 0;
      let velocityY = 0;

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
      const newX = character.x + velocityX * deltaTime;
      const newY = character.y + velocityY * deltaTime;

      let nextX = character.x;
      let nextY = character.y;
      if (isWalkable(newX, character.y)) nextX = newX;
      if (isWalkable(character.x, newY)) nextY = newY;

      let frameX = character.frameX;
      let lastFrameTime = character.lastFrameTime;
      if (isMoving && performance.now() - lastFrameTime > FRAME_DURATION) {
        frameX = (frameX + 1) % 4;
        lastFrameTime = performance.now();
      } else if (!isMoving) {
        frameX = 0;
      }

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

      onPositionUpdate({ x: nextX, y: nextY });
    };

    const gameLoop = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      if (spriteSheet.current.complete) {
        updateCharacter(deltaTime);
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
  }, [isWalkable, onPositionUpdate]);

  const render = (ctx) => {
    if (!spriteSheet.current.complete) return;

    const srcX = character.frameX * 68 + 2;
    const srcY = character.frameY * 68 + 2;
    const offsetCharX = (32 - CHARACTER_DISPLAY_SIZE) / 2 * scale;
    const offsetCharY = (32 - CHARACTER_DISPLAY_SIZE) / 2 * scale;

    ctx.drawImage(
      spriteSheet.current,
      srcX,
      srcY,
      64,
      64,
      offsetX + character.x * scale + offsetCharX,
      offsetY + character.y * scale + offsetCharY,
      CHARACTER_DISPLAY_SIZE * scale,
      CHARACTER_DISPLAY_SIZE * scale
    );
  };

  return { render, position: { x: character.x, y: character.y } };
};

export default useCharacter;