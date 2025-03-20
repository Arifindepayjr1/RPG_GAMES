// src/components/Character.jsx
import { useEffect, useState } from 'react';
import { TILE_SIZE, SPRITE_WIDTH, SPRITE_HEIGHT, BORDER_WIDTH, SPACING_WIDTH, CHARACTER_DISPLAY_SIZE, CHARACTER_SPEED, blockingBaseTiles, blockingItemIDs, TRANSITION_COOLDOWN, map1, overlayLayer1, secondOverlayLayer1 } from '../data';

const Character = ({
  initialX,
  initialY,
  setPosition,
  currentMap,
  setCurrentMap,
  transitioning,
  setTransitioning,
  transitionAlpha,
  setTransitionAlpha,
  transitionFadeIn,
  setTransitionFadeIn,
  canvasRef,
}) => {
  const [character, setCharacter] = useState({
    x: initialX,
    y: initialY,
    frameX: 0,
    frameY: 2,
    frameCount: 0,
    direction: 'down',
    isFighting: false,
    moving: false,
  });
  const [keys, setKeys] = useState({ w: false, s: false, a: false, d: false, j: false });
  const [lastTransitionTime, setLastTransitionTime] = useState(0);

  const spriteSheet = new Image();
  spriteSheet.src = '/hero.png';

  const isWalkable = (newX, newY) => {
    const tileX = Math.floor(newX / TILE_SIZE);
    const tileY = Math.floor(newY / TILE_SIZE);

    if (tileX < 0 || tileX >= 30 || tileY < 0 || tileY >= 20) return false;

    const baseTile = map1[tileY][tileX];
    const overlayTile = overlayLayer1[tileY][tileX];
    const secondOverlayTile = secondOverlayLayer1[tileY][tileX];

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
    }
  };

  const startTransition = (targetMap, spawnRow, spawnCol) => {
    if (transitioning) return;
    setTransitioning(true);
    setTransitionAlpha(0);
    setTransitionFadeIn(false);
    setTimeout(() => {
      setCurrentMap(targetMap);
      setPosition({ x: spawnCol * TILE_SIZE, y: spawnRow * TILE_SIZE });
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
      if (key in keys) setKeys(prev => ({ ...prev, [key]: true }));
      if (key === 'j' && !character.isFighting) {
        setCharacter(prev => ({ ...prev, isFighting: true, frameY: 6, frameX: 0 }));
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key in keys) setKeys(prev => ({ ...prev, [key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [character, keys]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const gameLoop = () => {
      if (!spriteSheet.complete) return;

      // Update character logic
      if (!transitioning) {
        let newX = character.x;
        let newY = character.y;
        let isMoving = false;

        if (keys.w) { newY -= CHARACTER_SPEED; character.direction = 'up'; character.frameY = 5; isMoving = true; }
        if (keys.s) { newY += CHARACTER_SPEED; character.direction = 'down'; character.frameY = 2; isMoving = true; }
        if (keys.a) { newX -= CHARACTER_SPEED; character.direction = 'left'; character.frameY = 4; isMoving = true; }
        if (keys.d) { newX += CHARACTER_SPEED; character.direction = 'right'; character.frameY = 3; isMoving = true; }

        if (!character.isFighting && isMoving && isWalkable(newX, newY)) {
          setCharacter(prev => ({ ...prev, x: newX, y: newY, moving: true }));
          setPosition({ x: newX, y: newY });
        } else {
          setCharacter(prev => ({ ...prev, moving: false }));
        }

        setCharacter(prev => {
          const frameCount = prev.frameCount + 1;
          let frameX = prev.frameX;
          if (prev.isFighting && frameCount % 10 === 0) {
            frameX = (frameX + 1) % 4;
            if (frameX === 0) return { ...prev, frameCount, frameX, isFighting: false };
          } else if (isMoving && frameCount % 5 === 0) {
            frameX = (frameX + 1) % 4;
          } else if (!isMoving) {
            frameX = 0;
          }
          return { ...prev, frameCount, frameX };
        });

        checkMapTransition();
      }

      updateTransition();

      // Draw character
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

      requestAnimationFrame(gameLoop);
    };

    spriteSheet.onload = () => requestAnimationFrame(gameLoop);
  }, [character, keys, transitioning, transitionAlpha, transitionFadeIn, currentMap, setPosition, setCurrentMap, setTransitioning, setTransitionAlpha, setTransitionFadeIn, canvasRef]);

  return null; // Character doesn't render DOM elements, only draws on canvas
};

export default Character;