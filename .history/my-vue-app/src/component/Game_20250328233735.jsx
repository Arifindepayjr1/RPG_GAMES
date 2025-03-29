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
  const [isExiting, setIsExiting] = useState(false);
  const attackButtonBounds = useRef({ x: 400, y: 0, width: 160, height: 40 });
  const npcSpriteSheets = useRef({});

  // Refs to mirror state (unchanged)
  const showInventoryRef = useRef(showInventory);
  const gamePausedRef = useRef(gamePaused);
  const inventoryRef = useRef(inventory);
  const showChestRef = useRef(showChest);
  const currentChestRef = useRef(currentChest);
  const isPausedRef = useRef(isPaused);
  const isExitingRef = useRef(isExiting);

  // Sync refs with state (unchanged)
  useEffect(() => { showInventoryRef.current = showInventory; }, [showInventory]);
  useEffect(() => { gamePausedRef.current = gamePaused; }, [gamePaused]);
  useEffect(() => { inventoryRef.current = inventory; characterRef.current.inventory = inventory; }, [inventory]);
  useEffect(() => { showChestRef.current = showChest; }, [showChest]);
  useEffect(() => { currentChestRef.current = currentChest; }, [currentChest]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isExitingRef.current = isExiting; }, [isExiting]);

  const tileset = new Image();
  tileset.src = '/222.png';
  const spriteSheet = new Image();
  spriteSheet.src = '/hero.png';

  const CHARACTER_SPEED = 0.15;
  const SPRITE_ANIMATION_SPEED = 6;
  const MOVE_COOLDOWN = 150;
  let lastMoveTime = 0;

  // Updated NPC data with frame-specific info
  const npcs = [
    { 
      x: 18 * TILE_SIZE, 
      y: 4 * TILE_SIZE, 
      map: 'tilemap1', 
      type: 'npc', 
      name: 'Mage Anna', 
      dialogue: 'The rift is growing! ', 
      hasTalked: false, 
      spriteSrc: '/character1.png', 
      frameX: 0, 
      frameY: 0, 
      frameCount: 0, 
      maxFrames: 4, 
      frameWidth: 25, 
      frameHeight: 25, 
      spriteWidth: 96, 
      spriteHeight: 96 
    },
    { 
      x: 5 * TILE_SIZE, 
      y: 6 * TILE_SIZE, 
      map: 'tilemap1', 
      type: 'npc', 
      name: 'Blacksmith Ben', 
      dialogue: 'Greetings! Have you spoken to Mage Anna?', 
      hasTalked: false, 
      itemToGive: { id: 2, name: 'Crystal Sword', description: 'A powerful sword forged to defeat the Rift Lord.' }, 
      spriteSrc: '/character2.png', 
      frameX: 0, 
      frameY: 0, 
      frameCount: 0, 
      maxFrames: 7, 
      frameWidth: 25, 
      frameHeight: 25, 
      spriteWidth: 96, 
      spriteHeight: 150 
    },
    { 
      x: 17 * TILE_SIZE, 
      y: 12 * TILE_SIZE, 
      map: 'tilemap3', 
      type: 'boss', 
      name: 'Rift Lord', 
      health: 100, 
      spriteSrc: '/final.png', 
      frameX: 0, 
      frameY: 0, 
      frameCount: 0, 
      maxFrames: 9, 
      frameWidth: 16, 
      frameHeight: 16, 
      spriteWidth: 810, 
      spriteHeight: 90 
    },
  ];

  // Load NPC spritesheets
  useEffect(() => {
    npcs.forEach(npc => {
      if (npc.spriteSrc && !npcSpriteSheets.current[npc.spriteSrc]) {
        const spriteSheet = new Image();
        spriteSheet.src = npc.spriteSrc;
        npcSpriteSheets.current[npc.spriteSrc] = spriteSheet;
      }
    });
  }, []);

  // Rest of your existing variables (unchanged)
  const items = {
    2: { id: 2, name: 'Iron Sword', description: 'A sturdy iron sword for close combat.' },
    25: { id: 25, name: 'Magical Crystal', description: 'A glowing crystal needed to seal the rift.' },
    37: { id: 37, name: 'Wooden Shield', description: 'A basic shield for defense.' },
    101: { id: 101, name: 'Health Potion', description: 'Restores 20 health when used.' },
    102: { id: 102, name: 'Leather Armor', description: 'Light armor for basic protection.' },
    103: { id: 103, name: 'Gold Coin', description: 'A shiny coin worth 10 gold.' },
    104: { id: 104, name: 'Mana Crystal', description: 'Restores 15 mana when used.' },
    105: { id: 105, name: 'Steel Dagger', description: 'A sharp dagger for quick attacks.' },
    106: { id: 106, name: 'Fire Scroll', description: 'Casts a fire spell when used.' },
    107: { id: 107, name: 'Silver Ring', description: 'Increases magic resistance by 5%.' },
  };

  const chests = [
    { x: 4 * TILE_SIZE, y: 3 * TILE_SIZE, map: 'tilemap1', tileId: 36, contents: [items[2], items[102], items[103]] },
    { x: 14 * TILE_SIZE, y: 5 * TILE_SIZE, map: 'tilemap2', tileId: 2, contents: [items[101], items[104], items[105]] },
    { x: 15 * TILE_SIZE, y: 4 * TILE_SIZE, map: 'tilemap3', tileId: 15, contents: [items[37], items[106]] },
    { x: 20 * TILE_SIZE, y: 4 * TILE_SIZE, map: 'tilemap3', tileId: 15, contents: [items[37], items[107]] },
  ];

  // Existing functions (unchanged unless noted)
  const setDialogueSync = (text) => { dialogueRef.current = text; };

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
      characterRef.current.targetX = spawnCol * TILE_SIZE;
      characterRef.current.targetY = spawnRow * TILE_SIZE;
      transitionFadeInRef.current = true;
      setDialogueSync('');
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

  const checkInteraction = () => {
    const playerTileX = Math.floor(characterRef.current.x / TILE_SIZE);
    const playerTileY = Math.floor(characterRef.current.y / TILE_SIZE);

    const adjacentTiles = [
      { x: playerTileX, y: playerTileY - 1 },
      { x: playerTileX, y: playerTileY + 1 },
      { x: playerTileX - 1, y: playerTileY },
      { x: playerTileX + 1, y: playerTileY },
    ];

    const nearbyChest = chests.find(chest => 
      chest.map === currentMapRef.current &&
      adjacentTiles.some(tile => {
        const chestTileX = Math.floor(chest.x / TILE_SIZE);
        const chestTileY = Math.floor(chest.y / TILE_SIZE);
        return chestTileX === tile.x && chestTileY === tile.y;
      })
    );

    if (nearbyChest) {
      if (dialogueRef.current !== `[Chest] Press J to open.`) {
        setDialogueSync(`[Chest] Press J to open.`);
      }

      if (keysRef.current.j && !keysRef.current.jPressed) {
        keysRef.current.jPressed = true;
        setShowChest(true);
        setCurrentChest(nearbyChest);
        setGamePaused(true);
        setDialogueSync('');
      }
      return;
    }

    const nearbyNPC = npcs.find(npc => 
      npc.map === currentMapRef.current &&
      adjacentTiles.some(tile => {
        const npcTileX = Math.floor(npc.x / TILE_SIZE);
        const npcTileY = Math.floor(npc.y / TILE_SIZE);
        return npcTileX === tile.x && npcTileY === tile.y;
      })
    );

    if (nearbyNPC) {
      if (nearbyNPC.type === 'npc') {
        if (dialogueRef.current !== `[${nearbyNPC.name}] Press J to talk.` && dialogueRef.current !== `${nearbyNPC.name}: ${nearbyNPC.dialogue}`) {
          setDialogueSync(`[${nearbyNPC.name}] Press J to talk.`);
        }
        setShowAttackButton(false);

        if (keysRef.current.j && !keysRef.current.jPressed) {
          keysRef.current.jPressed = true;

          if (dialogueRef.current === `[${nearbyNPC.name}] Press J to talk.`) {
            nearbyNPC.hasTalked = true;
            let dialogueText = `${nearbyNPC.name}: ${nearbyNPC.dialogue}`;

            if (nearbyNPC.name === 'Mage Anna') {
              if (inventoryRef.current.some(item => item.id === 25)) {
                dialogueText = `${nearbyNPC.name}: Thank you for finding the crystal! Please take it to Blacksmith Ben to forge a weapon.`;
                setInventory(prev => prev.filter(item => item.id !== 25));
                nearbyNPC.dialogue = 'Hurry, the rift is growing stronger!';
                nearbyNPC.x = 22 * TILE_SIZE;
                nearbyNPC.y = 4 * TILE_SIZE;
              }
            } else if (nearbyNPC.name === 'Blacksmith Ben') {
              if (npcs[0].hasTalked && inventoryRef.current.some(item => item.id === 25)) {
                dialogueText = `${nearbyNPC.name}: I see you have the crystal! I’ll forge a weapon for you.`;
                if (nearbyNPC.itemToGive) {
                  setInventory(prev => {
                    if (!prev.some(item => item.id === nearbyNPC.itemToGive.id)) {
                      return [...prev, nearbyNPC.itemToGive];
                    }
                    return prev;
                  });
                  dialogueText += `\n${nearbyNPC.name}: Here, take this ${nearbyNPC.itemToGive.name}! It will help you defeat the Rift Lord.`;
                  nearbyNPC.itemToGive = null;
                  nearbyNPC.dialogue = 'Go to the rift in the south and defeat the Rift Lord!';
                }
              } else if (npcs[0].hasTalked) {
                dialogueText += '\nPlease find the magical crystal in the western cave.';
              }
            }

            setDialogueSync(dialogueText);
          } else {
            setDialogueSync(`[${nearbyNPC.name}] Press J to talk.`);
          }
        }
      } else if (nearbyNPC.type === 'boss') {
        if (dialogueRef.current !== `[${nearbyNPC.name}] Fight me!` && dialogueRef.current !== `You attack the monster!` && dialogueRef.current !== `Monster attacks back!` && dialogueRef.current !== `${nearbyNPC.name} defeated!`) {
          setDialogueSync(`[${nearbyNPC.name}] Fight me!`);
        }
        setShowAttackButton(true);

        if (keysRef.current.j && !keysRef.current.jPressed) {
          keysRef.current.jPressed = true;

          const hasCrystalSword = inventoryRef.current.some(item => item.id === 2);
          const damage = hasCrystalSword ? 15 : 10;
          nearbyNPC.health -= damage;
          setDialogueSync(`You attack the monster${hasCrystalSword ? ' with the Crystal Sword' : ''}!`);

          if (nearbyNPC.health > 0) {
            characterRef.current.health -= 5;
            setDialogueSync(`Monster attacks back!`);
            setDialogueSync(`[${nearbyNPC.name}] Fight me!`);
          } else {
            setDialogueSync(`${nearbyNPC.name} defeated!`);
            nearbyNPC.health = 0;
            setShowAttackButton(false);
          }
        }
      }
    } else {
      setDialogueSync('');
      setShowAttackButton(false);
    }

    if (characterRef.current.health <= 0) {
      setDialogueSync('Game Over! You died.');
      setShowAttackButton(false);
    }

    if (!keysRef.current.j) {
      keysRef.current.jPressed = false;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key in keysRef.current) keysRef.current[key] = true;
      if (key === 'i') {
        setShowInventory(prev => !prev);
        if (showChest) {
          setShowChest(false);
          setCurrentChest(null);
        }
        setGamePaused(prev => !showInventoryRef.current || showChestRef.current);
      }
      if (key === 'escape') {
        setIsPaused(prev => !prev);
        if (showInventory) setShowInventory(false);
        if (showChest) {
          setShowChest(false);
          setCurrentChest(null);
        }
        setGamePaused(false);
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
  }, [showChest, showInventory]);

  const draggingItem = useRef(null);
  const draggingOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (!showChestRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const chestBoxX = 180;
      const chestBoxY = 120;
      const chestBoxWidth = 300;
      const chestBoxHeight = 400;

      currentChestRef.current.contents.forEach((item, index) => {
        const yPos = chestBoxY + 80 + index * 40;
        const itemBounds = { x: chestBoxX + 20, y: yPos - 20, width: 200, height: 30 };

        if (
          mouseX >= itemBounds.x &&
          mouseX <= itemBounds.x + itemBounds.width &&
          mouseY >= itemBounds.y &&
          mouseY <= itemBounds.y + itemBounds.height
        ) {
          draggingItem.current = { item, index, x: mouseX, y: mouseY };
          draggingOffset.current = { x: mouseX - itemBounds.x, y: mouseY - itemBounds.y };
        }
      });
    };

    const handleMouseMove = (e) => {
      if (!draggingItem.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      draggingItem.current.x = mouseX - draggingOffset.current.x;
      draggingItem.current.y = mouseY - draggingOffset.current.y;
    };

    const handleMouseUp = (e) => {
      if (!draggingItem.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const inventoryBoxX = 480;
      const inventoryBoxY = 120;
      const inventoryBoxWidth = 300;
      const inventoryBoxHeight = 400;

      if (
        mouseX >= inventoryBoxX &&
        mouseX <= inventoryBoxX + inventoryBoxWidth &&
        mouseY >= inventoryBoxY &&
        mouseY <= inventoryBoxY + inventoryBoxHeight
      ) {
        const { item, index } = draggingItem.current;
        setInventory(prev => [...prev, item]);
        setCurrentChest(prev => {
          const newContents = [...prev.contents];
          newContents.splice(index, 1);
          return { ...prev, contents: newContents };
        });
      }

      draggingItem.current = null;
    };

    canvasRef.current.addEventListener('mousedown', handleMouseDown);
    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    canvasRef.current.addEventListener('mouseup', handleMouseUp);
    return () => {
      canvasRef.current.removeEventListener('mousedown', handleMouseDown);
      canvasRef.current.removeEventListener('mousemove', handleMouseMove);
      canvasRef.current.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

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
      npc.frameX = 0;
      npc.frameCount = 0;
    });
  };

  useEffect(() => {
    const handleCanvasClick = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (isPausedRef.current) {
        const boxX = (canvasRef.current.width - 300) / 2;
        const boxY = 120;
        const buttonWidth = 260;
        const buttonHeight = 40;

        const resumeButton = { x: boxX + 20, y: boxY + 80, width: buttonWidth, height: buttonHeight };
        if (
          clickX >= resumeButton.x &&
          clickX <= resumeButton.x + resumeButton.width &&
          clickY >= resumeButton.y &&
          clickY <= resumeButton.y + resumeButton.height
        ) {
          setIsPaused(false);
        }

        const restartButton = { x: boxX + 20, y: boxY + 140, width: buttonWidth, height: buttonHeight };
        if (
          clickX >= restartButton.x &&
          clickX <= restartButton.x + restartButton.width &&
          clickY >= restartButton.y &&
          clickY <= restartButton.y + restartButton.height
        ) {
          resetGameState();
        }

        const exitButton = { x: boxX + 20, y: boxY + 200, width: buttonWidth, height: buttonHeight };
        if (
          clickX >= exitButton.x &&
          clickX <= exitButton.x + exitButton.width &&
          clickY >= exitButton.y &&
          clickY <= exitButton.y + exitButton.height
        ) {
          setIsExiting(true);
          resetGameState();
          setTimeout(() => {
            if (onExitToMenu) onExitToMenu();
          }, 500);
        }
        return;
      }

      if (
        showAttackButton &&
        clickX >= attackButtonBounds.current.x &&
        clickX <= attackButtonBounds.current.x + attackButtonBounds.current.width &&
        clickY >= attackButtonBounds.current.y &&
        clickY <= attackButtonBounds.current.y + attackButtonBounds.current.height
      ) {
        const nearbyNPC = npcs.find(npc => 
          npc.map === currentMapRef.current &&
          npc.type === 'boss' &&
          Math.abs(Math.floor(characterRef.current.x / TILE_SIZE) - Math.floor(npc.x / TILE_SIZE)) <= 1 &&
          Math.abs(Math.floor(characterRef.current.y / TILE_SIZE) - Math.floor(npc.y / TILE_SIZE)) <= 1
        );

        if (nearbyNPC) {
          const hasCrystalSword = inventoryRef.current.some(item => item.id === 2);
          const damage = hasCrystalSword ? 15 : 10;
          nearbyNPC.health -= damage;
          setDialogueSync(`You attack the monster${hasCrystalSword ? ' with the Crystal Sword' : ''}!`);

          if (nearbyNPC.health > 0) {
            characterRef.current.health -= 5;
            setDialogueSync(`Monster attacks back!`);
            setDialogueSync(`[${nearbyNPC.name}] Fight me!`);
          } else {
            setDialogueSync(`${nearbyNPC.name} defeated!`);
            nearbyNPC.health = 0;
            setShowAttackButton(false);
          }
        }
      }
    };

    canvasRef.current.addEventListener('click', handleCanvasClick);
    return () => {
      canvasRef.current.removeEventListener('click', handleCanvasClick);
    };
  }, [showAttackButton, isPaused, onExitToMenu]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
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
            Math.round(col * TILE_SIZE), Math.round(row * TILE_SIZE),
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
              Math.round(col * TILE_SIZE), Math.round(row * TILE_SIZE),
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
              Math.round(col * TILE_SIZE), Math.round(row * TILE_SIZE),
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
              Math.round(col * TILE_SIZE), Math.round(row * TILE_SIZE),
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

    const drawNPCs = (deltaTime) => {
      npcs.forEach(npc => {
        if (npc.map === currentMapRef.current && (npc.type === 'npc' || npc.health > 0)) {
          const spriteSheetToUse = npcSpriteSheets.current[npc.spriteSrc];
          if (!spriteSheetToUse || !spriteSheetToUse.complete) return;

          // Update NPC animation

          // Calculate frame position based on spritesheet dimensions
          const frameSpacingX = (npc.spriteWidth - npc.frameWidth * npc.maxFrames) / (npc.maxFrames - 1 || 1);
          const srcX = npc.frameX * (npc.frameWidth + frameSpacingX);
          const srcY = npc.frameY * npc.frameHeight; // frameY = 0, so this is 0
          const offsetX = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;
          const offsetY = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;

          const renderX = Math.round(npc.x + offsetX);
          const renderY = Math.round(npc.y + offsetY);

          ctx.drawImage(
            spriteSheetToUse,
            srcX, srcY,
            npc.frameWidth, npc.frameHeight,
            renderX, renderY,
            CHARACTER_DISPLAY_SIZE, CHARACTER_DISPLAY_SIZE
          );
        }
      });
    };

    const updateCharacter = (deltaTime) => {
      if (transitioningRef.current || gamePausedRef.current || isPausedRef.current) return;

      const currentTime = Date.now();

      if (characterRef.current.moveProgress > 0 && characterRef.current.moveProgress < 1) {
        characterRef.current.moveProgress += CHARACTER_SPEED * (deltaTime / 16.67);
        if (characterRef.current.moveProgress >= 1) {
          characterRef.current.moveProgress = 0;
          characterRef.current.x = characterRef.current.targetX;
          characterRef.current.y = characterRef.current.targetY;
          characterRef.current.moving = false;
        } else {
          characterRef.current.x = characterRef.current.x + (characterRef.current.targetX - characterRef.current.x) * characterRef.current.moveProgress;
          characterRef.current.y = characterRef.current.y + (characterRef.current.targetY - characterRef.current.y) * characterRef.current.moveProgress;
        }
      }

      if (characterRef.current.moveProgress > 0 || currentTime - lastMoveTime < MOVE_COOLDOWN) return;

      let newTargetX = characterRef.current.targetX;
      let newTargetY = characterRef.current.targetY;
      let isMoving = false;

      if (keysRef.current.w) {
        newTargetY -= TILE_SIZE;
        characterRef.current.direction = 'up';
        characterRef.current.frameY = 5;
        isMoving = true;
      }
      if (keysRef.current.s) {
        newTargetY += TILE_SIZE;
        characterRef.current.direction = 'down';
        characterRef.current.frameY = 2;
        isMoving = true;
      }
      if (keysRef.current.a) {
        newTargetX -= TILE_SIZE;
        characterRef.current.direction = 'left';
        characterRef.current.frameY = 4;
        isMoving = true;
      }
      if (keysRef.current.d) {
        newTargetX += TILE_SIZE;
        characterRef.current.direction = 'right';
        characterRef.current.frameY = 3;
        isMoving = true;
      }

      if (isMoving && isWalkable(newTargetX, newTargetY)) {
        characterRef.current.targetX = newTargetX;
        characterRef.current.targetY = newTargetY;
        characterRef.current.moveProgress = 0.01;
        characterRef.current.moving = true;
        lastMoveTime = currentTime;

        const tileX = Math.floor(newTargetX / TILE_SIZE);
        const tileY = Math.floor(newTargetY / TILE_SIZE);
        const { overlay } = getCurrentMapData();
        const overlayTile = overlay[tileY][tileX];

        if (overlayTile && !collectedItems.includes(`${tileY}-${tileX}`)) {
          if (overlayTile === 25) {
            setInventory(prev => [...prev, items[25]]);
            setCollectedItems(prev => [...prev, `${tileY}-${tileX}`]);
            setDialogueSync('You found the Magical Crystal!');
            overlay[tileY][tileX] = null;
          }
        }
      }

      characterRef.current.frameCount += deltaTime;
      if (characterRef.current.moving && characterRef.current.frameCount >= SPRITE_ANIMATION_SPEED) {
        characterRef.current.frameX = (characterRef.current.frameX + 1) % 4;
        characterRef.current.frameCount = 0;
      } else if (!characterRef.current.moving) {
        characterRef.current.frameX = 0;
        characterRef.current.frameCount = 0;
      }

      checkMapTransition();
      checkInteraction();
    };

    const drawHealthBars = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(50, 580, 200, 30);
      ctx.fillStyle = 'red';
      const playerHealthWidth = (characterRef.current.health / 100) * 180;
      ctx.fillRect(60, 590, playerHealthWidth, 10);
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText(`Player HP: ${characterRef.current.health}`, 60, 605);

      const nearbyBoss = npcs.find(npc => 
        npc.map === currentMapRef.current &&
        npc.type === 'boss' &&
        Math.abs(Math.floor(characterRef.current.x / TILE_SIZE) - Math.floor(npc.x / TILE_SIZE)) <= 1 &&
        Math.abs(Math.floor(characterRef.current.y / TILE_SIZE) - Math.floor(npc.y / TILE_SIZE)) <= 1
      );

      if (nearbyBoss && nearbyBoss.health > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(710, 580, 200, 30);
        ctx.fillStyle = 'red';
        const bossHealthWidth = (nearbyBoss.health / 100) * 180;
        ctx.fillRect(720, 590, bossHealthWidth, 10);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`Boss HP: ${nearbyBoss.health}`, 720, 605);
      }
    };

    const drawDialogue = () => {
      let dialogueBoxHeight = 0;

      if (dialogueRef.current) {
        const gradient = ctx.createLinearGradient(50, 400, 50, 500);
        gradient.addColorStop(0, 'rgba(20, 30, 60, 0.9)');
        gradient.addColorStop(1, 'rgba(40, 60, 120, 0.9)');
        ctx.fillStyle = gradient;
        ctx.fillRect(50, 400, 860, 100);

        ctx.strokeStyle = 'gold';
        ctx.lineWidth = 3;
        ctx.strokeRect(50, 400, 860, 100);

        ctx.font = '22px Arial';
        ctx.fillStyle = '#F0E68C';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 3;
        ctx.fillText(dialogueRef.current, 70, 450);
        ctx.shadowColor = 'transparent';

        dialogueBoxHeight += 100;
      }

      if (showAttackButton) {
        attackButtonBounds.current.y = 400 + dialogueBoxHeight;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fillRect(attackButtonBounds.current.x, attackButtonBounds.current.y, attackButtonBounds.current.width, attackButtonBounds.current.height);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(attackButtonBounds.current.x, attackButtonBounds.current.y, attackButtonBounds.current.width, attackButtonBounds.current.height);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Attack (J)', attackButtonBounds.current.x + 30, attackButtonBounds.current.y + 28);
        dialogueBoxHeight += 50;
      }
    };

    const drawInventoryScreen = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const boxWidth = 300;
      const boxHeight = 400;
      const boxX = showChestRef.current ? 480 : (canvas.width - boxWidth) / 2;
      const boxY = 120;

      const gradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
      gradient.addColorStop(0, 'rgba(20, 30, 60, 0.9)');
      gradient.addColorStop(1, 'rgba(40, 60, 120, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 3;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      ctx.fillStyle = '#F0E68C';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Inventory (I to Close)', boxX + boxWidth / 2, boxY + 40);
      ctx.textAlign = 'left';

      if (inventoryRef.current.length === 0) {
        ctx.fillStyle = '#F0E68C';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Inventory is empty', boxX + boxWidth / 2, boxY + boxHeight / 2);
        ctx.textAlign = 'left';
      } else {
        inventoryRef.current.forEach((item, index) => {
          const yPos = boxY + 80 + index * 40;
          ctx.fillStyle = '#F0E68C';
          ctx.font = '18px Arial';
          ctx.fillText(item.name, boxX + 20, yPos);
          ctx.font = '14px Arial';
          ctx.fillStyle = '#D3D3D3';
          ctx.fillText(item.description, boxX + 20, yPos + 20);
        });
      }
    };

    const drawChestScreen = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const boxWidth = 300;
      const boxHeight = 400;
      const boxX = 180;
      const boxY = 120;

      const gradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
      gradient.addColorStop(0, 'rgba(50, 30, 20, 0.9)');
      gradient.addColorStop(1, 'rgba(80, 50, 30, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 3;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      ctx.fillStyle = '#F0E68C';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Chest (I to Close)', boxX + boxWidth / 2, boxY + 40);
      ctx.textAlign = 'left';

      if (currentChestRef.current.contents.length === 0) {
        ctx.fillStyle = '#F0E68C';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Chest is empty', boxX + boxWidth / 2, boxY + boxHeight / 2);
        ctx.textAlign = 'left';
      } else {
        currentChestRef.current.contents.forEach((item, index) => {
          const yPos = boxY + 80 + index * 40;
          ctx.fillStyle = '#F0E68C';
          ctx.font = '18px Arial';
          ctx.fillText(item.name, boxX + 20, yPos);
          ctx.font = '14px Arial';
          ctx.fillStyle = '#D3D3D3';
          ctx.fillText(item.description, boxX + 20, yPos + 20);
        });
      }

      if (draggingItem.current) {
        const { x, y, item } = draggingItem.current;
        ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        ctx.fillRect(x, y, 200, 30);
        ctx.fillStyle = '#000000';
        ctx.font = '18px Arial';
        ctx.fillText(item.name, x + 5, y + 20);
      }
    };

    const drawPauseMenu = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const boxWidth = 300;
      const boxHeight = 300;
      const boxX = (canvas.width - boxWidth) / 2;
      const boxY = 120;

      const gradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
      gradient.addColorStop(0, 'rgba(20, 30, 60, 0.9)');
      gradient.addColorStop(1, 'rgba(40, 60, 120, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 3;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      ctx.fillStyle = '#F0E68C';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Paused (Esc to Resume)', boxX + boxWidth / 2, boxY + 40);

      const buttonWidth = 260;
      const buttonHeight = 40;
      const buttonX = boxX + 20;

      ctx.fillStyle = 'rgba(0, 128, 0, 0.7)';
      ctx.fillRect(buttonX, boxY + 80, buttonWidth, buttonHeight);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(buttonX, boxY + 80, buttonWidth, buttonHeight);
      ctx.fillStyle = 'white';
      ctx.font = '18px Arial';
      ctx.fillText('Resume', buttonX + buttonWidth / 2, boxY + 105);

      ctx.fillStyle = 'rgba(255, 165, 0, 0.7)';
      ctx.fillRect(buttonX, boxY + 140, buttonWidth, buttonHeight);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(buttonX, boxY + 140, buttonWidth, buttonHeight);
      ctx.fillStyle = 'white';
      ctx.font = '18px Arial';
      ctx.fillText('Restart', buttonX + buttonWidth / 2, boxY + 165);

      ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.fillRect(buttonX, boxY + 200, buttonWidth, buttonHeight);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(buttonX, boxY + 200, buttonWidth, buttonHeight);
      ctx.fillStyle = 'white';
      ctx.font = '18px Arial';
      ctx.fillText('Exit to Main Menu', buttonX + buttonWidth / 2, boxY + 225);

      ctx.textAlign = 'left';
    };

    const gameLoop = (timestamp) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const deltaTime = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      if (isExitingRef.current) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawTilemap();
      drawNPCs(deltaTime);
      updateCharacter(deltaTime);
      drawCharacter(characterRef.current.x, characterRef.current.y, characterRef.current.frameX, characterRef.current.frameY);

      if (transitioningRef.current) {
        ctx.fillStyle = `rgba(0, 0, 0, ${transitionAlphaRef.current})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        updateTransition();
      }

      drawHealthBars();
      drawDialogue();

      if (showInventoryRef.current) drawInventoryScreen();
      if (showChestRef.current) {
        drawChestScreen();
        drawInventoryScreen();
      }
      if (isPausedRef.current) drawPauseMenu();

      requestAnimationFrame(gameLoop);
    };

    const startGame = () => {
      if (tileset.complete && spriteSheet.complete) {
        requestAnimationFrame(gameLoop);
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
      onClick={() => canvasRef.current.focus()}
    />
  );
};

export default Game;