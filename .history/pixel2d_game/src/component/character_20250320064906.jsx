import React, { useState, useEffect, useRef } from 'react';
import { SPRITE_WIDTH, SPRITE_HEIGHT, BORDER_WIDTH, SPACING_WIDTH, CHARACTER_DISPLAY_SIZE, CHARACTER_SPEED, TILE_SIZE } from '../constants';

const Character = ({ ctx, map, overlayLayer, secondOverlayLayer, isWalkable, checkMapTransition, currentMap }) => {
  const spriteSheetRef = useRef(new Image());
  const [character, setCharacter] = useState({
    x: 0,
    y: 0,
    frameX: 0,
    frameY: 2,
    frameCount: 0,
    direction: 'down',
    isFighting: false,
    moving: false
  });
  const [keys, setKeys] = useState({ w: false, s: false, a: false, d: false, j: false });

  useEffect(() => {
    spriteSheetRef.current.src = 'hero.png';
    const urlParams = new URLSearchParams(window.location.search);
    const spawnRow = parseInt(urlParams.get('spawnRow')) || (currentMap === 'tilemap1' ? 15 : currentMap === 'tilemap2' ? 4 : 8);
    const spawnCol = parseInt(urlParams.get('spawnCol')) || (currentMap === 'tilemap1' ? 0 : currentMap === 'tilemap2' ? 12 : 3);
    
    setCharacter(prev => ({
      ...prev,
      x: spawnCol * TILE_SIZE,
      y: spawnRow * TILE_SIZE
    }));

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key in keys) {
        setKeys(prev => ({ ...prev, [key]: true }));
      }
      if (key === 'j' && !character.isFighting) {
        setCharacter(prev => ({ ...prev, isFighting: true, frameY: 6, frameX: 0 }));
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key in keys) {
        setKeys(prev => ({ ...prev, [key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentMap]);

  const updateAnimation = (isMoving) => {
    setCharacter(prev => {
      const newFrameCount = prev.frameCount + 1;
      let newFrameX = prev.frameX;
      
      if (prev.isFighting) {
        if (newFrameCount % 10 === 0) {
          newFrameX = (newFrameX + 1) % 4;
          return { ...prev, frameX: newFrameX, frameCount: newFrameCount, isFighting: newFrameX !== 0 };
        }
      } else if (isMoving && newFrameCount % 5 === 0) {
        newFrameX = (newFrameX + 1) % 4;
      } else if (!isMoving) {
        newFrameX = 0;
      }
      return { ...prev, frameX: newFrameX, frameCount: newFrameCount };
    });
  };

  const updateCharacter = () => {
    if (window.isTransitioning) return;

    let newX = character.x;
    let newY = character.y;
    let isMoving = false;

    if (keys.w) { newY -= CHARACTER_SPEED; character.direction = 'up'; character.frameY = 5; isMoving = true; }
    if (keys.s) { newY += CHARACTER_SPEED; character.direction = 'down'; character.frameY = 2; isMoving = true; }
    if (keys.a) { newX -= CHARACTER_SPEED; character.direction = 'left'; character.frameY = 4; isMoving = true; }
    if (keys.d) { newX += CHARACTER_SPEED; character.direction = 'right'; character.frameY = 3; isMoving = true; }

    if (!character.isFighting && isMoving && isWalkable(newX, newY)) {
      setCharacter(prev => ({ ...prev, x: newX, y: newY, moving: true }));
    } else {
      setCharacter(prev => ({ ...prev, moving: false }));
    }

    updateAnimation(isMoving);
    checkMapTransition(character.x, character.y);
  };

  const drawCharacter = () => {
    if (!spriteSheetRef.current.complete) return;
    
    const srcX = character.frameX * (SPRITE_WIDTH + BORDER_WIDTH + SPACING_WIDTH) + BORDER_WIDTH;
    const srcY = character.frameY * (SPRITE_HEIGHT + BORDER_WIDTH + SPACING_WIDTH) + BORDER_WIDTH;
    const offsetX = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;
    const offsetY = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;

    ctx.drawImage(
      spriteSheetRef.current,
      srcX, srcY,
      SPRITE_WIDTH, SPRITE_HEIGHT,
      character.x + offsetX, character.y + offsetY,
      CHARACTER_DISPLAY_SIZE, CHARACTER_DISPLAY_SIZE
    );
  };

  return { updateCharacter, drawCharacter };
};

export default Character;