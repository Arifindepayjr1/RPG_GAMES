// src/components/Game.jsx
import React, { useRef, useEffect, useState } from 'react';
import { TILE_SIZE, map1, overlayLayer1, secondOverlayLayer1, map2, overlayLayer2, secondOverlayLayer2, map3, overlayLayer3, secondOverlayLayer3, tilePositions, SPRITE_WIDTH, SPRITE_HEIGHT, BORDER_WIDTH, SPACING_WIDTH, CHARACTER_DISPLAY_SIZE, blockingBaseTiles, blockingItemIDs, TRANSITION_COOLDOWN } from '../data';

const Game = ({ onExitToMenu }) => {
  const canvasRef = useRef(null);
  const characterRef = useRef({
    x: 5 * TILE_SIZE,
    y: 15 * TILE_SIZE,
    frameX: 0,
    frameY: 2,
    frameCount: 0,
    direction: 'down',
    moving: false,
    health: 100,
    inventory: [],
    targetX: 5 * TILE_SIZE,
    targetY: 15 * TILE_SIZE,
    moveProgress: 0,
  });
  const keysRef = useRef({ w: false, s: false, a: false, d: false, j: false, jPressed: false });
  const currentMapRef = useRef('tilemap1');
  const transitioningRef = useRef(false);
  const transitionAlphaRef = useRef(0);
  const transitionFadeInRef = useRef(false);
  const lastTransitionTimeRef = useRef(0);
  const lastTimestampRef = useRef(null);
  const dialogueRef = useRef('');
  const [inventory, setInventory] = useState([]);
  const [collectedItems, setCollectedItems] = useState([]);
  const [showAttackButton, setShowAttackButton] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [showChest, setShowChest] = useState(false);
  const [currentChest, setCurrentChest] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false); // New state for exiting
  const attackButtonBounds = useRef({ x: 400, y: 0, width: 160, height: 40 });
  const npcSpriteSheets = useRef({});
  const draggingItem = useRef(null);
  const draggingOffset = useRef({ x: 0, y: 0 });

  // Create refs to mirror state
  const showInventoryRef = useRef(showInventory);
  const gamePausedRef = useRef(gamePaused);
  const inventoryRef = useRef(inventory);
  const showChestRef = useRef(showChest);
  const currentChestRef = useRef(currentChest);
  const isPausedRef = useRef(isPaused);
  const isExitingRef = useRef(isExiting); // New ref for exiting state

  // Keep refs in sync with state
  useEffect(() => {
    showInventoryRef.current = showInventory;
  }, [showInventory]);

  useEffect(() => {
    gamePausedRef.current = gamePaused;
    console.log('gamePaused updated to:', gamePaused);
  }, [gamePaused]);

  useEffect(() => {
    inventoryRef.current = inventory;
    characterRef.current.inventory = inventory;
  }, [inventory]);

  useEffect(() => {
    showChestRef.current = showChest;
    console.log('showChest updated to:', showChest);
  }, [showChest]);

  useEffect(() => {
    currentChestRef.current = currentChest;
  }, [currentChest]);

  useEffect(() => {
    isPausedRef.current = isPaused;
    console.log('isPaused updated to:', isPaused);
  }, [isPaused]);

  useEffect(() => {
    isExitingRef.current = isExiting;
    console.log('isExiting updated to:', isExiting);
  }, [isExiting]);

  // ... (rest of the existing state and refs remain unchanged)

  // Reset game state function
  const resetGameState = () => {
    characterRef.current = {
      x: 5 * TILE_SIZE,
      y: 15 * TILE_SIZE,
      frameX: 0,
      frameY: 2,
      frameCount: 0,
      direction: 'down',
      moving: false,
      health: 100,
      inventory: [],
      targetX: 5 * TILE_SIZE,
      targetY: 15 * TILE_SIZE,
      moveProgress: 0,
    };
    setInventory([]);
    setCollectedItems([]);
    setShowAttackButton(false);
    setShowInventory(false);
    setShowChest(false);
    setCurrentChest(null);
    setGamePaused(false);
    setIsPaused(false);
    currentMapRef.current = 'tilemap1';
    dialogueRef.current = '';
    // Reset NPCs
    npcs.forEach(npc => {
      if (npc.type === 'npc') {
        npc.hasTalked = false;
        if (npc.name === 'Mage Anna') {
          npc.x = 18 * TILE_SIZE;
          npc.y = 4 * TILE_SIZE;
          npc.dialogue = 'The rift is growing! ';
        } else if (npc.name === 'Blacksmith Ben') {
          npc.dialogue = 'Greetings! Have you spoken to Mage Anna?';
          npc.itemToGive = { id: 2, name: 'Crystal Sword', description: 'A powerful sword forged to defeat the Rift Lord.' };
        }
      } else if (npc.type === 'boss') {
        npc.health = 100;
      }
    });
  };

  // ... (rest of the existing code until the canvas click handler)

  useEffect(() => {
    const handleCanvasClick = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Handle pause menu clicks
      if (isPausedRef.current) {
        const boxX = (canvasRef.current.width - 300) / 2;
        const boxY = 120;
        const buttonWidth = 260;
        const buttonHeight = 40;

        // Resume button
        const resumeButton = { x: boxX + 20, y: boxY + 80, width: buttonWidth, height: buttonHeight };
        if (
          clickX >= resumeButton.x &&
          clickX <= resumeButton.x + resumeButton.width &&
          clickY >= resumeButton.y &&
          clickY <= resumeButton.y + resumeButton.height
        ) {
          setIsPaused(false);
          console.log('Resume clicked, unpausing game');
        }

        // Restart button
        const restartButton = { x: boxX + 20, y: boxY + 140, width: buttonWidth, height: buttonHeight };
        if (
          clickX >= restartButton.x &&
          clickX <= restartButton.x + restartButton.width &&
          clickY >= restartButton.y &&
          clickY <= restartButton.y + restartButton.height
        ) {
          console.log('Restart clicked, resetting game');
          resetGameState();
        }

        // Exit to Main Menu button
        const exitButton = { x: boxX + 20, y: boxY + 200, width: buttonWidth, height: buttonHeight };
        if (
          clickX >= exitButton.x &&
          clickX <= exitButton.x + exitButton.width &&
          clickY >= exitButton.y &&
          clickY <= exitButton.y + exitButton.height
        ) {
          console.log('Exit to Main Menu clicked');
          setIsExiting(true); // Trigger the exit state
          resetGameState(); // Reset all game state
          setTimeout(() => {
            if (onExitToMenu) {
              onExitToMenu(); // Call the exit function after a delay to allow for animation
            }
          }, 500); // Delay to allow for any visual feedback (e.g., fade-out in App.jsx)
        }
        return;
      }

      // ... (rest of the handleCanvasClick function remains unchanged)
    };

    canvasRef.current.addEventListener('click', handleCanvasClick);
    return () => {
      canvasRef.current.removeEventListener('click', handleCanvasClick);
    };
  }, [showAttackButton, isPaused, onExitToMenu]);

  // ... (rest of the existing code until the game loop)

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }
    ctx.imageSmoothingEnabled = false;

    // ... (rest of the existing setup code)

    const gameLoop = (timestamp) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const deltaTime = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      // Stop the game loop if exiting
      if (isExitingRef.current) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Clear the canvas to black
        return; // Stop the game loop
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawTilemap();
      drawNPCs();
      updateCharacter(deltaTime);
      drawCharacter(characterRef.current.x, characterRef.current.y, characterRef.current.frameX, characterRef.current.frameY);

      if (transitioningRef.current) {
        ctx.fillStyle = `rgba(0, 0, 0, ${transitionAlphaRef.current})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        updateTransition();
      }

      drawHealthBars();
      drawDialogue();

      if (showInventoryRef.current) {
        console.log('Drawing inventory screen, inventory:', inventoryRef.current);
        drawInventoryScreen();
      }

      if (showChestRef.current) {
        drawChestScreen();
        drawInventoryScreen();
      }

      if (isPausedRef.current) {
        drawPauseMenu();
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={960}
      height={640}
      tabIndex={0}
      style={{ border: '1px solid white', display: 'block' }}
      onClick={() => {
        canvasRef.current.focus();
        console.log('Canvas focused');
      }}
    />
  );
};

export default Game;