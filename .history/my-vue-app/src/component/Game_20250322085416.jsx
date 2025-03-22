// src/components/Game.jsx
import React, { useRef, useEffect, useState } from 'react';
import { TILE_SIZE, map1, overlayLayer1, secondOverlayLayer1, map2, overlayLayer2, secondOverlayLayer2, map3, overlayLayer3, secondOverlayLayer3, tilePositions, SPRITE_WIDTH, SPRITE_HEIGHT, BORDER_WIDTH, SPACING_WIDTH, CHARACTER_DISPLAY_SIZE, blockingBaseTiles, blockingItemIDs, TRANSITION_COOLDOWN, items, chestContents, chests } from '../data';

const Game = () => {
  const canvasRef = useRef(null);
  const characterRef = useRef({
    x: 0 * TILE_SIZE, // Spawn at row 15, col 0 in tilemap1 (as per /*SPAWN HERE*/)
    y: 15 * TILE_SIZE,
    frameX: 0,
    frameY: 2,
    frameCount: 0,
    direction: 'down',
    moving: false,
  });
  const keysRef = useRef({ w: false, s: false, a: false, d: false, e: false, k: false });
  const currentMapRef = useRef('tilemap1');
  const transitioningRef = useRef(false);
  const transitionAlphaRef = useRef(0);
  const transitionFadeInRef = useRef(false);
  const lastTransitionTimeRef = useRef(0);

  // Inventory state
  const [characterInventory, setCharacterInventory] = useState([]); // Array of item IDs (max 4 slots)
  const [showInventory, setShowInventory] = useState(false); // Toggle character inventory UI
  const [chestInventory, setChestInventory] = useState(null); // Items in the currently open chest (null if no chest open)
  const [chestPosition, setChestPosition] = useState(null); // Position of the open chest (e.g., { row: 3, col: 4 })

  const tileset = new Image();
  tileset.src = '/222.png';
  const spriteSheet = new Image();
  spriteSheet.src = '/hero.png';

  const CHARACTER_SPEED = 1; // Kept at 1 (60 pixels/second at 60 FPS)
  const INVENTORY_SLOTS = 4; // Max slots in character inventory
  const CHEST_INTERACTION_RANGE = 1; // Tiles away from chest to interact (1 tile range)

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
      // Close inventory when transitioning maps
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

  // Check if the character is near a chest
  const checkForChest = () => {
    const charTileX = Math.floor(characterRef.current.x / TILE_SIZE);
    const charTileY = Math.floor(characterRef.current.y / TILE_SIZE);
    const currentChests = chests[currentMapRef.current] || [];

    // Check if the character is near any chest
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

  // Open the chest inventory
  const openChest = (chestPos) => {
    const chestKey = `${currentMapRef.current}_${chestPos.row}_${chestPos.col}`;
    const chestItems = chestContents[chestKey] || [];
    setChestInventory(chestItems);
    setChestPosition(chestPos);
    setShowInventory(false); // Close character inventory if open
  };

  // Transfer an item from the chest to the character's inventory
  const takeItemFromChest = (itemId) => {
    if (characterInventory.length >= INVENTORY_SLOTS) {
      console.log("Inventory full!");
      return;
    }

    // Add item to character inventory
    setCharacterInventory(prev => [...prev, itemId]);

    // Remove item from chest
    setChestInventory(prev => prev.filter(id => id !== itemId));

    // If chest is empty, close it
    if (chestInventory.length === 1) { // Length 1 because this runs before state updates
      setChestInventory(null);
      setChestPosition(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key in keysRef.current) keysRef.current[key] = true;

      // Toggle inventory with 'k'
      if (key === 'k' && !keysRef.current.k) {
        setShowInventory(prev => !prev);
        setChestInventory(null); // Close chest inventory if open
        setChestPosition(null);
      }

      // Interact with chest with 'e'
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

  // Handle mouse clicks for inventory interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e) => {
      if (!chestInventory) return; // Only handle clicks if chest inventory is open

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Check if click is within chest inventory slots
      const slotWidth = 60;
      const slotHeight = 60;
      const startX = 700; // Chest inventory position
      const startY = 300;

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
    ctx.imageSmoothingEnabled = false; // Disable smoothing for pixel-perfect rendering

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

      // Draw character inventory background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(200, 200, 300, 200);

      // Draw slots
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

        // Draw slot
        ctx.strokeStyle = 'white';
        ctx.strokeRect(slotX, slotY, slotWidth, slotHeight);

        // Draw item if exists
        if (characterInventory[i]) {
          const item = items[characterInventory[i]];
          ctx.fillText(item.name, slotX + 5, slotY + 30);
        }
      }
    };

    const drawChestInventory = () => {
      if (!chestInventory) return;

      // Draw chest inventory background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(600, 200, 300, 200);

      // Draw slots
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

        // Draw slot
        ctx.strokeStyle = 'white';
        ctx.strokeRect(slotX, slotY, slotWidth, slotHeight);

        // Draw item
        const item = items[itemId];
        ctx.fillText(item.name, slotX + 5, slotY + 30);
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