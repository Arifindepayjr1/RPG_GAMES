// src/components/Game.jsx
import React, { useRef, useEffect, useState } from 'react';
import { TILE_SIZE, map1, overlayLayer1, secondOverlayLayer1, map2, overlayLayer2, secondOverlayLayer2, map3, overlayLayer3, secondOverlayLayer3, tilePositions, SPRITE_WIDTH, SPRITE_HEIGHT, BORDER_WIDTH, SPACING_WIDTH, CHARACTER_DISPLAY_SIZE, blockingBaseTiles, blockingItemIDs, TRANSITION_COOLDOWN } from '../data';

const Game = () => {
  const canvasRef = useRef(null);
  const characterRef = useRef({
    x: 0 * TILE_SIZE, // Spawn at row 15, col 0 in tilemap1
    y: 15 * TILE_SIZE,
    frameX: 0,
    frameY: 2,
    frameCount: 0,
    direction: 'down',
    moving: false,
    health: 100, // Added for boss combat
  });
  const keysRef = useRef({ w: false, s: false, a: false, d: false, j: false }); // Added 'j' for interaction
  const currentMapRef = useRef('tilemap1');
  const transitioningRef = useRef(false);
  const transitionAlphaRef = useRef(0);
  const transitionFadeInRef = useRef(false);
  const lastTransitionTimeRef = useRef(0);
  const [dialogue, setDialogue] = useState(''); // For NPC and boss interaction

  const tileset = new Image();
  tileset.src = '/222.png';
  const spriteSheet = new Image();
  spriteSheet.src = '/hero.png';

  const CHARACTER_SPEED = 1;

  // Define NPCs and Boss based on your map comments
  const npcs = [
    { x: 18 * TILE_SIZE, y: 4 * TILE_SIZE, map: 'tilemap1', type: 'npc' }, // NPC HERE (row 4, col 18)
    { x: 5 * TILE_SIZE, y: 6 * TILE_SIZE, map: 'tilemap1', type: 'npc' },  // NPC HERE (row 6, col 5)
    { x: 17 * TILE_SIZE, y: 12 * TILE_SIZE, map: 'tilemap3', type: 'boss', health: 100 }, // FINAL BOSS (row 12, col 17)
  ];

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

    // Prevent walking into NPCs or boss
    const isOccupied = npcs.some(npc => 
      npc.map === currentMapRef.current && 
      Math.floor(npc.x / TILE_SIZE) === tileX && 
      Math.floor(npc.y / TILE_SIZE) === tileY
    );

    return !(
      blockingBaseTiles.includes(baseTile) ||
      (overlayTile && blockingItemIDs.includes(overlayTile)) ||
      (secondOverlayTile && blockingItemIDs.includes(secondOverlayTile)) ||
      isOccupied
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
      setDialogue(''); // Clear dialogue on transition
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

  // Add interaction with NPCs and boss
  const checkInteraction = () => {
    const playerTileX = Math.floor(characterRef.current.x / TILE_SIZE);
    const playerTileY = Math.floor(characterRef.current.y / TILE_SIZE);

    const adjacentTiles = [
      { x: playerTileX, y: playerTileY - 1 }, // Up
      { x: playerTileX, y: playerTileY + 1 }, // Down
      { x: playerTileX - 1, y: playerTileY }, // Left
      { x: playerTileX + 1, y: playerTileY }, // Right
    ];

    const nearbyNPC = npcs.find(npc => 
      npc.map === currentMapRef.current &&
      adjacentTiles.some(tile => 
        Math.floor(npc.x / TILE_SIZE) === tile.x && 
        Math.floor(npc.y / TILE_SIZE) === tile.y
      )
    );

    if (nearbyNPC) {
      if (nearbyNPC.type === 'npc') {
        setDialogue('Press J to talk.');
        if (keysRef.current.j) {
          setDialogue('NPC: Hello, adventurer!');
          keysRef.current.j = false; // Prevent continuous triggering
        }
      } else if (nearbyNPC.type === 'boss') {
        setDialogue('Boss: Fight me! Press J to attack.');
        if (keysRef.current.j) {
          nearbyNPC.health -= 10;
          setDialogue(`You hit the boss! Boss HP: ${nearbyNPC.health}`);
          
          if (nearbyNPC.health > 0) {
            characterRef.current.health -= 5;
            setDialogue(prev => `${prev}\nBoss hits back! Your HP: ${characterRef.current.health}`);
          } else {
            setDialogue('Boss defeated!');
            nearbyNPC.health = 0;
          }
          
          keysRef.current.j = false;
        }
      }
    } else {
      setDialogue('');
    }

    if (characterRef.current.health <= 0) {
      setDialogue('Game Over! You died.');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key in keysRef.current) keysRef.current[key] = true;
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

    const drawCharacter = (x, y, frameX, frameY) => {
      if (!spriteSheet.complete) return;

      const srcX = frameX * (SPRITE_WIDTH + BORDER_WIDTH + SPACING_WIDTH) + BORDER_WIDTH;
      const srcY = frameY * (SPRITE_HEIGHT + BORDER_WIDTH + SPACING_WIDTH) + BORDER_WIDTH;
      const offsetX = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;
      const offsetY = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;

      const renderX = Math.round(x + offsetX);
      const renderY = Math.round(y + offsetY);

      ctx.drawImage(
        spriteSheet,
        srcX, srcY,
        SPRITE_WIDTH, SPRITE_HEIGHT,
        renderX, renderY,
        CHARACTER_DISPLAY_SIZE, CHARACTER_DISPLAY_SIZE
      );
    };

    // Add NPC rendering
    const drawNPCs = () => {
      npcs.forEach(npc => {
        if (npc.map === currentMapRef.current && (npc.type === 'npc' || npc.health > 0)) {
          drawCharacter(npc.x, npc.y, 0, 2); // Static, facing down
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
      checkInteraction(); // Check for NPC/boss interaction
    };

    // Add dialogue rendering
    const drawDialogue = () => {
      if (dialogue) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(50, 400, 860, 100);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(dialogue, 60, 540);
      }
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawTilemap();
      drawNPCs(); // Draw NPCs on top of the map
      updateCharacter();
      drawCharacter(characterRef.current.x, characterRef.current.y, characterRef.current.frameX, characterRef.current.frameY);

      if (transitioningRef.current) {
        ctx.fillStyle = `rgba(0, 0, 0, ${transitionAlphaRef.current})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        updateTransition();
      }

      drawDialogue();

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
  }, []);

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