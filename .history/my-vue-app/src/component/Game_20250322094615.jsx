// src/components/Game.jsx
import React, { useRef, useEffect, useState } from 'react';
import { TILE_SIZE, map1, overlayLayer1, secondOverlayLayer1, map2, overlayLayer2, secondOverlayLayer2, map3, overlayLayer3, secondOverlayLayer3, tilePositions, SPRITE_WIDTH, SPRITE_HEIGHT, BORDER_WIDTH, SPACING_WIDTH, CHARACTER_DISPLAY_SIZE, blockingBaseTiles, blockingItemIDs, TRANSITION_COOLDOWN, items, chestContents, chests } from '../data';

const Game = () => {
  const canvasRef = useRef(null);
  const characterRef = useRef({
    x: 0 * TILE_SIZE,
    y: 15 * TILE_SIZE,
    frameX: 0,
    frameY: 2,
    direction: 'down',
    moving: false,
  });
  const keysRef = useRef({ w: false, s: false, a: false, d: false, e: false, k: false });
  const currentMapRef = useRef('tilemap1');
  const transitioningRef = useRef(false);
  const transitionAlphaRef = useRef(0);
  const transitionFadeInRef = useRef(false);
  const lastTransitionTimeRef = useRef(0);

  const [characterInventory, setCharacterInventory] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [chestInventory, setChestInventory] = useState(null);
  const [chestPosition, setChestPosition] = useState(null);

  const tileset = new Image();
  tileset.src = '/222.png';
  const spriteSheet = new Image();
  spriteSheet.src = '/hero.png';

  const CHARACTER_SPEED = 1;
  const INVENTORY_SLOTS = 4;
  const CHEST_INTERACTION_RANGE = 1;

  const getCurrentMapData = () => {
    switch (currentMapRef.current) {
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
    const tileX = Math.floor(characterRef.current.x / TILE_SIZE);
    const tileY = Math.floor(characterRef.current.y / TILE_SIZE);
    const currentTime = Date.now();

    if (currentTime - lastTransitionTimeRef.current < TRANSITION_COOLDOWN) return;

    if (currentMapRef.current === 'tilemap1') {
      if (tileY === 2 && tileX === 24) {
        startTransition('tilemap2', 4, 12);
        lastTransitionTimeRef.current = currentTime;
      } else if (tileY === 19 && tileX === 14) {
        startTransition('tilemap3', 8, 3);
        lastTransitionTimeRef.current = currentTime;
      }
    } else if (currentMapRef.current === 'tilemap2') {
      if (tileY === 3 && tileX === 12) {
        startTransition('tilemap1', 3, 24);
        lastTransitionTimeRef.current = currentTime;
      }
    } else if (currentMapRef.current === 'tilemap3') {
      if (tileY === 8 && tileX === 3) {
        startTransition('tilemap1', 18, 14);
        lastTransitionTimeRef.current = currentTime;
      }
    }
  };

  const startTransition = (targetMap, spawnRow, spawnCol) => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    transitionAlphaRef.current = 0;
    transitionFadeInRef.current = false;
    setTimeout(() => {
      currentMapRef.current = targetMap;
      characterRef.current.x = spawnCol * TILE_SIZE;
      characterRef.current.y = spawnRow * TILE_SIZE;
      transitionFadeInRef.current = true;
      setShowInventory(false);
      setChestInventory(null);
      setChestPosition(null);
    }, 500);
  };

  const updateTransition = () => {
    if (!transitioningRef.current) return;

    if (!transitionFadeInRef.current) {
      transitionAlphaRef.current = Math.min(transitionAlphaRef.current + 0.05, 1);
    } else {
      transitionAlphaRef.current -= 0.05;
      if (transitionAlphaRef.current <= 0) transitioningRef.current = false;
    }
  };

  const checkForChest = () => {
    const charTileX = Math.floor(characterRef.current.x / TILE_SIZE);
    const charTileY = Math.floor(characterRef.current.y / TILE_SIZE);
    const currentChests = chests[currentMapRef.current] || [];

    for (const chest of currentChests) {
      const { row, col } = chest;
      const distanceX = Math.abs(charTileX - col);
      const distanceY = Math.abs(charTileY - row);

      if (distanceX <= CHEST_INTERACTION_RANGE && distanceY <= CHEST_INTERACTION_RANGE) {
        return { row, col };
      }
    }
    return null;
  };

  const openChest = (chestPos) => {
    const chestKey = `${currentMapRef.current}_${chestPos.row}_${chestPos.col}`;
    const chestItems = chestContents[chestKey] || [];
    setChestInventory(chestItems);
    setChestPosition(chestPos);
    setShowInventory(false);
  };

  const takeItemFromChest = (itemId) => {
    if (characterInventory.length >= INVENTORY_SLOTS) {
      console.log("Inventory full!");
      return;
    }

    setCharacterInventory(prev => [...prev, itemId]);
    setChestInventory(prev => prev.filter(id => id !== itemId));

    if (chestInventory.length === 1) {
      setChestInventory(null);
      setChestPosition(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key in keysRef.current) keysRef.current[key] = true;

      if (key === 'k' && !keysRef.current.k) {
        setShowInventory(prev => !prev);
        setChestInventory(null);
        setChestPosition(null);
      }

      if (key === 'e' && !keysRef.current.e) {
        const chestPos = checkForChest();
        if (chestPos) {
          openChest(chestPos);
        }
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key in keysRef.current) keysRef.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e) => {
      if (!chestInventory) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const slotWidth = 60;
      const slotHeight = 60;
      const startX = 620;
      const startY = 250;

      chestInventory.forEach((itemId, index) => {
        const slotX = startX + (index % 2) * (slotWidth + 10);
        const slotY = startY + Math.floor(index / 2) * (slotHeight + 10);

        if (
          clickX >= slotX &&
          clickX <= slotX + slotWidth &&
          clickY >= slotY &&
          clickY <= slotY + slotHeight
        ) {
          takeItemFromChest(itemId);
        }
      });
    };

    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [chestInventory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const drawTilemap = () => {
      if (!tileset.complete) {
        console.log("Tileset not loaded yet");
        return;
      }
      const { map, overlay, secondOverlay, grassTile } = getCurrentMapData();

      // Draw base tiles (including grass tiles explicitly)
      for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
          let tileId = map[row][col];
          // Use grassTile as a fallback for tile 0 (empty tile)
          if (tileId === 0) tileId = grassTile;
          const tilePos = tilePositions[tileId];
          if (tilePos) {
            ctx.drawImage(
              tileset,
              tilePos.x, tilePos.y,
              16, 16,
              col * TILE_SIZE, row * TILE_SIZE,
              TILE_SIZE, TILE_SIZE
            );
          } else {
            console.warn(`No tile position for tile ID ${tileId} at Row ${row}, Col ${col}`);
          }
        }
      }

      // Draw overlay layer (items and chests)
      for (let row = 0; row < overlay.length; row++) {
        for (let col = 0; col < overlay[row].length; col++) {
          const tileId = overlay[row][col];
          if (tileId === null) continue;

          // Check if tileId is an item (e.g., 41, 42)
          if (items[tileId]) {
            const { x, y } = items[tileId].sprite;
            ctx.drawImage(
              tileset,
              x, y,
              16, 16,
              col * TILE_SIZE, row * TILE_SIZE,
              TILE_SIZE, TILE_SIZE
            );
          } else {
            // Otherwise, assume it's a base tile (e.g., 36 for chests)
            const tilePos = tilePositions[tileId];
            if (tilePos) {
              ctx.drawImage(
                tileset,
                tilePos.x, tilePos.y,
                16, 16,
                col * TILE_SIZE, row * TILE_SIZE,
                TILE_SIZE, TILE_SIZE
              );
            } else {
              console.warn(`No sprite for overlay ID ${tileId} at Row ${row}, Col ${col}`);
            }
          }
        }
      }

      // Draw second overlay layer (currently unused, but keep for completeness)
      for (let row = 0; row < secondOverlay.length; row++) {
        for (let col = 0; col < secondOverlay[row].length; col++) {
          const tileId = secondOverlay[row][col];
          if (tileId === null) continue;
          const tilePos = tilePositions[tileId];
          if (tilePos) {
            ctx.drawImage(
              tileset,
              tilePos.x, tilePos.y,
              16, 16,
              col * TILE_SIZE, row * TILE_SIZE,
              TILE_SIZE, TILE_SIZE
            );
          } else {
            console.warn(`No tile position for second overlay ID ${tileId} at Row ${row}, Col ${col}`);
          }
        }
      }
    };

    const drawCharacter = () => {
      if (!spriteSheet.complete) return;

      const srcX = characterRef.current.frameX * (SPRITE_WIDTH + BORDER_WIDTH + SPACING_WIDTH) + BORDER_WIDTH;
      const srcY = characterRef.current.frameY * (SPRITE_HEIGHT + BORDER_WIDTH + SPACING_WIDTH) + BORDER_WIDTH;
      const offsetX = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;
      const offsetY = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;

      const renderX = Math.round(characterRef.current.x + offsetX);
      const renderY = Math.round(characterRef.current.y + offsetY);

      ctx.drawImage(
        spriteSheet,
        srcX, srcY,
        SPRITE_WIDTH, SPRITE_HEIGHT,
        renderX, renderY,
        CHARACTER_DISPLAY_SIZE, CHARACTER_DISPLAY_SIZE
      );
    };

    const drawInventory = () => {
      if (!showInventory) return;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(200, 200, 300, 200);

      const slotWidth = 60;
      const slotHeight = 60;
      const startX = 220;
      const startY = 250;

      ctx.font = '16px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText('Inventory (K to close)', 220, 230);

      for (let i = 0; i < INVENTORY_SLOTS; i++) {
        const slotX = startX + (i % 2) * (slotWidth + 10);
        const slotY = startY + Math.floor(i / 2) * (slotHeight + 10);

        ctx.strokeStyle = 'white';
        ctx.strokeRect(slotX, slotY, slotWidth, slotHeight);

        if (characterInventory[i]) {
          const item = items[characterInventory[i]];
          if (item) {
            ctx.font = '10px Arial';
            ctx.fillStyle = 'white';
            const maxWidth = slotWidth - 10;
            const words = item.name.split(' ');
            let line = '';
            let y = slotY + slotHeight - 20;
            for (let word of words) {
              const testLine = line + word + ' ';
              const metrics = ctx.measureText(testLine);
              if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line, slotX + 5, y);
                line = word + ' ';
                y += 12;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line, slotX + 5, y);
          } else {
            console.warn(`Item ID ${characterInventory[i]} not found in items object`);
          }
        }
      }
    };

    const drawChestInventory = () => {
      if (!chestInventory) return;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(600, 200, 300, 200);

      const slotWidth = 60;
      const slotHeight = 60;
      const startX = 620;
      const startY = 250;

      ctx.font = '16px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText('Chest (Click to take)', 620, 230);

      chestInventory.forEach((itemId, index) => {
        const slotX = startX + (index % 2) * (slotWidth + 10);
        const slotY = startY + Math.floor(index / 2) * (slotHeight + 10);

        ctx.strokeStyle = 'white';
        ctx.strokeRect(slotX, slotY, slotWidth, slotHeight);

        const item = items[itemId];
        if (item) {
          ctx.font = '10px Arial';
          ctx.fillStyle = 'white';
          const maxWidth = slotWidth - 10;
          const words = item.name.split(' ');
          let line = '';
          let y = slotY + slotHeight - 20;
          for (let word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
              ctx.fillText(line, slotX + 5, y);
              line = word + ' ';
              y += 12;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, slotX + 5, y);
        } else {
          console.warn(`Item ID ${itemId} not found in items object`);
        }
      });
    };

    const updateCharacter = () => {
      if (transitioningRef.current) return;

      let newX = characterRef.current.x;
      let newY = characterRef.current.y;
      let isMoving = false;

      if (keysRef.current.w) {
        newY -= CHARACTER_SPEED;
        characterRef.current.direction = 'up';
        characterRef.current.frameY = 5;
        isMoving = true;
      }
      if (keysRef.current.s) {
        newY += CHARACTER_SPEED;
        characterRef.current.direction = 'down';
        characterRef.current.frameY = 2;
        isMoving = true;
      }
      if (keysRef.current.a) {
        newX -= CHARACTER_SPEED;
        characterRef.current.direction = 'left';
        characterRef.current.frameY = 4;
        isMoving = true;
      }
      if (keysRef.current.d) {
        newX += CHARACTER_SPEED;
        characterRef.current.direction = 'right';
        characterRef.current.frameY = 3;
        isMoving = true;
      }

      if (isMoving && isWalkable(newX, newY)) {
        characterRef.current.x = newX;
        characterRef.current.y = newY;
        characterRef.current.moving = true;
      } else {
        characterRef.current.moving = false;
      }

      characterRef.current.frameCount += 1;
      if (isMoving && characterRef.current.frameCount % 10 === 0) {
        characterRef.current.frameX = (characterRef.current.frameX + 1) % 4;
      } else if (!isMoving) {
        characterRef.current.frameX = 0;
      }

      checkMapTransition();
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawTilemap();
      updateCharacter();
      drawCharacter();
      drawInventory();
      drawChestInventory();

      if (transitioningRef.current) {
        ctx.fillStyle = `rgba(0, 0, 0, ${transitionAlphaRef.current})`;
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
  }, [characterInventory, showInventory, chestInventory]);

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