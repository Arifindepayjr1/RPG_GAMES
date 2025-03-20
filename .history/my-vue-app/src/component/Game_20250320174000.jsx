// src/components/Game.jsx
import React, { useRef, useEffect, useState } from 'react';
import { TILE_SIZE, map1, overlayLayer1, secondOverlayLayer1, map2, overlayLayer2, secondOverlayLayer2, map3, overlayLayer3, secondOverlayLayer3, tilePositions, SPRITE_WIDTH, SPRITE_HEIGHT, BORDER_WIDTH, SPACING_WIDTH, CHARACTER_DISPLAY_SIZE, blockingBaseTiles, blockingItemIDs, TRANSITION_COOLDOWN } from '../data';

const Game = () => {
  const canvasRef = useRef(null);
  const [currentMap, setCurrentMap] = useState('tilemap1');
  const [character, setCharacter] = useState({
    x: 0 * TILE_SIZE, // Spawn at row 15, col 0 in tilemap1
    y: 15 * TILE_SIZE,
    frameX: 0,
    frameY: 2,
    frameCount: 0,
    direction: 'down',
    isFighting: false,
    moving: false,
  });
  const keysRef = useRef({ w: false, s: false, a: false, d: false, j: false });
  const [transitioning, setTransitioning] = useState(false);
  const [transitionAlpha, setTransitionAlpha] = useState(0);
  const [transitionFadeIn, setTransitionFadeIn] = useState(false);
  const [lastTransitionTime, setLastTransitionTime] = useState(0);

  const tileset = new Image();
  tileset.src = '/222.png';
  const spriteSheet = new Image();
  spriteSheet.src = '/hero.png';

  const CHARACTER_SPEED = 3; // Fixed speed from character.js (pixels per frame)

  const getCurrentMapData = () => {
    switch (currentMap) {
      case 'tilemap1': return { map: map1, overlay: overlayLayer1, secondOverlay: secondOverlayLayer1, grassTile: 12 };
      case 'tilemap2': return { map: map2, overlay: overlayLayer2, secondOverlay: secondOverlayLayer2, grassTile: 15 };
      case 'tilemap3': return { map: map3, overlay: overlayLayer3, secondOverlay: secondOverlayLayer3, grassTile: 15 };
      default: return { map: map1, overlay: overlayLayer1, secondOverlay: secondOverlayLayer1, grassTile: 12 };
    }
  };

  const isWalkable = (newX, newY) => {
    const tileX = Math.floor(newX / TILE_SIZE);
    const tileY = Math.floor(newY / TILE_SIZE);
    const { map, overlay, secondOverlay } = getCurrentMapData();

    if (tileX < 0 || tileX >= 30 || tileY < 0 || tileY >= 20) return false;

    const baseTile = map[tileY][tileX];
    const overlayTile = overlay[tileY][tileX];
    const secondOverlayTile = secondOverlay[tileY][tileX];

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

    if (currentTime - lastTransitionTime < TRANSITION_COOLDOWN) return;

    if (currentMap === 'tilemap1') {
      if (tileY === 2 && tileX === 24) {
        startTransition('tilemap2', 4, 12);
        setLastTransitionTime(currentTime);
      } else if (tileY === 19 && tileX === 14) {
        startTransition('tilemap3', 8, 3);
        setLastTransitionTime(currentTime);
      }
    } else if (currentMap === 'tilemap2') {
      if (tileY === 3 && tileX === 12) {
        startTransition('tilemap1', 3, 24);
        setLastTransitionTime(currentTime);
      }
    } else if (currentMap === 'tilemap3') {
      if (tileY === 8 && tileX === 3) {
        startTransition('tilemap1', 18, 14);
        setLastTransitionTime(currentTime);
      }
    }
  };

  const startTransition = (targetMap, spawnRow, spawnCol) => {
    if (transitioning) return;
    setTransitioning(true);
    setTransitionAlpha(0);
    setTransitionFadeIn(false);
    setTimeout(() => {
      setCurrentMap(targetMap);
      setCharacter(prev => ({ ...prev, x: spawnCol * TILE_SIZE, y: spawnRow * TILE_SIZE }));
      setTransitionFadeIn(true);
    }, 500);
  };

  const updateTransition = () => {
    if (!transitioning) return;

    if (!transitionFadeIn) {
      setTransitionAlpha(prev => Math.min(prev + 0.05, 1));
    } else {
      setTransitionAlpha(prev => {
        const newAlpha = prev - 0.05;
        if (newAlpha <= 0) setTransitioning(false);
        return newAlpha;
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key in keysRef.current) {
        keysRef.current[key] = true;
      }
      if (key === 'j' && !character.isFighting) {
        setCharacter(prev => ({ ...prev, isFighting: true, frameY: 6, frameX: 0 }));
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key in keysRef.current) {
        keysRef.current[key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [character]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const drawTilemap = () => {
      if (!tileset.complete) return;
      const { map, overlay, secondOverlay, grassTile } = getCurrentMapData();
      const grassPos = tilePositions[grassTile];

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

      for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
          const tileId = map[row][col];
          const tilePos = tilePositions[tileId];
          if (tilePos && tileId !== grassTile) {
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

      for (let row = 0; row < overlay.length; row++) {
        for (let col = 0; col < overlay[row].length; col++) {
          const tileId = overlay[row][col];
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

      for (let row = 0; row < secondOverlay.length; row++) {
        for (let col = 0; col < secondOverlay[row].length; col++) {
          const tileId = secondOverlay[row][col];
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

    const drawCharacter = () => {
      if (!spriteSheet.complete) return;

      const srcX = character.frameX * (SPRITE_WIDTH + BORDER_WIDTH + SPACING_WIDTH) + BORDER_WIDTH;
      const srcY = character.frameY * (SPRITE_HEIGHT + BORDER_WIDTH + SPACING_WIDTH) + BORDER_WIDTH;
      const offsetX = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;
      const offsetY = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;

      ctx.drawImage(
        spriteSheet,
        srcX, srcY,
        SPRITE_WIDTH, SPRITE_HEIGHT,
        character.x + offsetX, character.y + offsetY,
        CHARACTER_DISPLAY_SIZE, CHARACTER_DISPLAY_SIZE
      );
    };

    const updateCharacter = () => {
      if (transitioning) return;

      let newX = character.x;
      let newY = character.y;
      let isMoving = false;

      if (keysRef.current.w) {
        newY -= CHARACTER_SPEED;
        setCharacter(prev => ({ ...prev, direction: 'up', frameY: 5 }));
        isMoving = true;
      }
      if (keysRef.current.s) {
        newY += CHARACTER_SPEED;
        setCharacter(prev => ({ ...prev, direction: 'down', frameY: 2 }));
        isMoving = true;
      }
      if (keysRef.current.a) {
        newX -= CHARACTER_SPEED;
        setCharacter(prev => ({ ...prev, direction: 'left', frameY: 4 }));
        isMoving = true;
      }
      if (keysRef.current.d) {
        newX += CHARACTER_SPEED;
        setCharacter(prev => ({ ...prev, direction: 'right', frameY: 3 }));
        isMoving = true;
      }

      if (!character.isFighting && isMoving && isWalkable(newX, newY)) {
        setCharacter(prev => ({ ...prev, x: newX, y: newY, moving: true }));
      } else if (isMoving) {
        setCharacter(prev => ({ ...prev, moving: false }));
      } else {
        setCharacter(prev => ({ ...prev, moving: false }));
      }

      setCharacter(prev => {
        const frameCount = prev.frameCount + 1;
        let frameX = prev.frameX;
        if (prev.isFighting && frameCount % 10 === 0) {
          frameX = (frameX + 1) % 4;
          if (frameX === 0) return { ...prev, frameCount: 0, frameX, isFighting: false };
        } else if (isMoving && frameCount % 5 === 0) { // Matches character.js animation timing
          frameX = (frameX + 1) % 4;
        } else if (!isMoving) {
          frameX = 0;
        }
        return { ...prev, frameCount, frameX };
      });

      checkMapTransition();
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawTilemap();
      updateCharacter();
      drawCharacter();

      if (transitioning) {
        ctx.fillStyle = `rgba(0, 0, 0, ${transitionAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        updateTransition();
      }

      requestAnimationFrame(gameLoop);
    };

    const startGame = () => {
      if (tileset.complete && spriteSheet.complete) {
        requestAnimationFrame(gameLoop);
      } else {
        console.log('Waiting for assets to load...');
      }
    };

    tileset.onload = startGame;
    spriteSheet.onload = startGame;
    startGame();
  }, [character, transitioning, transitionAlpha, transitionFadeIn, currentMap]);

  return (
    <canvas
      ref={canvasRef}
      width={960}
      height={640}
      style={{ border: '1px solid white' }}
    />
  );
};

export default Game;