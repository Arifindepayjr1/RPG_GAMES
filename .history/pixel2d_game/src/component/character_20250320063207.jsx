import React, { useEffect, useRef, useState } from 'react';

const SPRITE_WIDTH = 64;
const SPRITE_HEIGHT = 64;
const BORDER_WIDTH = 2;
const SPACING_WIDTH = 2;
const NUM_ROWS = 10;
const NUM_COLUMNS = 6;
const CHARACTER_DISPLAY_SIZE = 96;
const CHARACTER_SPEED = 4; // Move 4 pixels per frame
const TRANSITION_COOLDOWN = 1000; // 1 second

const blockingBaseTiles = [1, 2, 3, 4, 5, 6, 7, 8, 13, 16, 21, 22, 23, 31, 32, 36, 57, 59, 60, 77, 89];
const blockingItemIDs = [25, 26, 27, 28, 33, 35, 37, 40, 41, 42, 43, 45, 46, 48, 49, 54, 55, 56, 58, 60, 61, 62, 77];

const Character = () => {
  const [character, setCharacter] = useState({
    x: 0,
    y: 0,
    frameX: 0,
    frameY: 2,
    frameCount: 0,
    direction: 'down',
    isFighting: false,
    moving: false,
  });

  const [keys, setKeys] = useState({ w: false, s: false, a: false, d: false, j: false });
  const [lastTransitionTime, setLastTransitionTime] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionAlpha, setTransitionAlpha] = useState(0);
  const [transitionTarget, setTransitionTarget] = useState(null);
  const spriteSheet = useRef(new Image());
  const canvasRef = useRef(null);

  // Load sprite sheet
  useEffect(() => {
    spriteSheet.current.src = 'hero.png'; // Adjust path to your sprite sheet
    spriteSheet.current.onload = () => console.log('Sprite sheet loaded');
    spriteSheet.current.onerror = () => console.error('Failed to load sprite sheet at hero.png');
  }, []);

  // Check if the character can walk on the tile
  const isWalkable = (x, y) => {
    const tileX = Math.floor(x / window.TILE_SIZE);
    const tileY = Math.floor(y / window.TILE_SIZE);

    if (tileX < 0 || tileX >= 30 || tileY < 0 || tileY >= 20) {
      console.log(`Out of bounds at tile (${tileY}, ${tileX})`);
      return false;
    }

    const baseTile = window.map[tileY][tileX];
    const overlayTile = window.overlayLayer[tileY][tileX];
    const secondOverlayTile = window.secondOverlayLayer[tileY][tileX];

    if (blockingBaseTiles.includes(baseTile)) {
      console.log(`Blocked by base tile ${baseTile} at (${tileY}, ${tileX})`);
      return false;
    }

    if (overlayTile && blockingItemIDs.includes(overlayTile)) {
      console.log(`Blocked by overlay itemID ${overlayTile} at (${tileY}, ${tileX})`);
      return false;
    }

    if (secondOverlayTile && blockingItemIDs.includes(secondOverlayTile)) {
      console.log(`Blocked by second overlay itemID ${secondOverlayTile} at (${tileY}, ${tileX})`);
      return false;
    }

    return true;
  };

  // Check for map transitions
  const checkMapTransition = () => {
    const tileX = Math.floor(character.x / window.TILE_SIZE);
    const tileY = Math.floor(character.y / window.TILE_SIZE);
    const currentTime = Date.now();

    if (currentTime - lastTransitionTime < TRANSITION_COOLDOWN) {
      return;
    }

    if (window.currentMap === 'tilemap1') {
      if (tileY === 2 && tileX === 24) {
        startTransition('tilemap2.html?spawnRow=4&spawnCol=12');
        setLastTransitionTime(currentTime);
      } else if (tileY === 19 && tileX === 14) {
        startTransition('tilemap3.html?spawnRow=8&spawnCol=3');
        setLastTransitionTime(currentTime);
      }
    } else if (window.currentMap === 'tilemap2') {
      if (tileY === 3 && tileX === 12) {
        startTransition('index.html?spawnRow=3&spawnCol=24');
        setLastTransitionTime(currentTime);
      }
    }
  };

  // Start map transition
  const startTransition = (url) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTransitionAlpha(0);
    setTransitionTarget(url);
  };

  // Update transition (fade effect)
  const updateTransition = () => {
    if (!isTransitioning) return;

    if (transitionAlpha < 1) {
      setTransitionAlpha(transitionAlpha + 0.05);
      if (transitionAlpha >= 1) {
        window.location.href = transitionTarget;
      }
    } else {
      setTransitionAlpha(transitionAlpha - 0.05);
      if (transitionAlpha <= 0) {
        setIsTransitioning(false);
        setTransitionTarget(null);
      }
    }
  };

  // Handle key press and key up
  const handleKeyDown = (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) {
      setKeys((prevKeys) => ({ ...prevKeys, [key]: true }));
    }
    if (key === 'j' && !character.isFighting) {
      setCharacter((prevCharacter) => ({
        ...prevCharacter,
        isFighting: true,
        frameY: 6,
        frameX: 0,
      }));
    }
  };

  const handleKeyUp = (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) {
      setKeys((prevKeys) => ({ ...prevKeys, [key]: false }));
    }
  };

  // Update character's position and animation
  const updateCharacter = () => {
    if (isTransitioning) return;

    let newX = character.x;
    let newY = character.y;
    let isMoving = false;

    if (keys.w) {
      newY -= CHARACTER_SPEED;
      setCharacter((prevCharacter) => ({ ...prevCharacter, direction: 'up', frameY: 5 }));
      isMoving = true;
    }
    if (keys.s) {
      newY += CHARACTER_SPEED;
      setCharacter((prevCharacter) => ({ ...prevCharacter, direction: 'down', frameY: 2 }));
      isMoving = true;
    }
    if (keys.a) {
      newX -= CHARACTER_SPEED;
      setCharacter((prevCharacter) => ({ ...prevCharacter, direction: 'left', frameY: 4 }));
      isMoving = true;
    }
    if (keys.d) {
      newX += CHARACTER_SPEED;
      setCharacter((prevCharacter) => ({ ...prevCharacter, direction: 'right', frameY: 3 }));
      isMoving = true;
    }

    if (!character.isFighting && isMoving && isWalkable(newX, newY)) {
      setCharacter((prevCharacter) => ({
        ...prevCharacter,
        x: newX,
        y: newY,
        moving: true,
      }));
    } else {
      setCharacter((prevCharacter) => ({ ...prevCharacter, moving: false }));
    }

    updateAnimation(character.moving);
    checkMapTransition();
  };

  // Update animation frame
  const updateAnimation = (isMoving) => {
    setCharacter((prevCharacter) => {
      const updatedFrameCount = prevCharacter.frameCount + 1;
      let updatedFrameX = prevCharacter.frameX;
      if (prevCharacter.isFighting) {
        if (updatedFrameCount % 10 === 0) {
          updatedFrameX = (updatedFrameX + 1) % 4;
          if (updatedFrameX === 0) {
            return { ...prevCharacter, isFighting: false, frameX: updatedFrameX };
          }
        }
      } else if (isMoving && updatedFrameCount % 5 === 0) {
        updatedFrameX = (updatedFrameX + 1) % 4;
      } else if (!isMoving) {
        updatedFrameX = 0;
      }
      return { ...prevCharacter, frameCount: updatedFrameCount, frameX: updatedFrameX };
    });
  };

  // Game loop
  const gameLoop = () => {
    updateCharacter();
    updateTransition();
    drawMap();
    drawCharacter();
    requestAnimationFrame(gameLoop);
  };

  // Draw character on canvas
  const drawCharacter = () => {
    const ctx = canvasRef.current.getContext('2d');
    if (!spriteSheet.current.complete) return;

    const srcX = character.frameX * (SPRITE_WIDTH + BORDER_WIDTH + SPACING_WIDTH) + BORDER_WIDTH;
    const srcY = character.frameY * (SPRITE_HEIGHT + BORDER_WIDTH + SPACING_WIDTH) + BORDER_WIDTH;
    const offsetX = (window.TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;
    const offsetY = (window.TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;

    ctx.drawImage(
      spriteSheet.current,
      srcX, srcY,
      SPRITE_WIDTH, SPRITE_HEIGHT,
      character.x + offsetX, character.y + offsetY,
      CHARACTER_DISPLAY_SIZE, CHARACTER_DISPLAY_SIZE
    );
  };

  // Draw map (if needed, you can implement this function in the future)
  const drawMap = () => {
    // Placeholder for drawing the map
  };

  // Start game loop once component is mounted
  useEffect(() => {
    gameLoop();
  }, [character]);

  return (
    <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />
  );
};

export default Character;
