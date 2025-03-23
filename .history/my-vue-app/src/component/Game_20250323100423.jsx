// src/components/Game.jsx
import React, { useRef, useEffect, useState } from 'react';
import { TILE_SIZE, map1, overlayLayer1, secondOverlayLayer1, map2, overlayLayer2, secondOverlayLayer2, map3, overlayLayer3, secondOverlayLayer3, tilePositions, SPRITE_WIDTH, SPRITE_HEIGHT, BORDER_WIDTH, SPACING_WIDTH, CHARACTER_DISPLAY_SIZE, blockingBaseTiles, blockingItemIDs, TRANSITION_COOLDOWN } from '../data';

const Game = () => {
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
  });
  const keysRef = useRef({ w: false, s: false, a: false, d: false, j: false, jPressed: false });
  const currentMapRef = useRef('tilemap1');
  const transitioningRef = useRef(false);
  const transitionAlphaRef = useRef(0);
  const transitionFadeInRef = useRef(false);
  const lastTransitionTimeRef = useRef(0);
  const dialogueTimerRef = useRef(null);
  const [dialogue, setDialogue] = useState('');
  const dialogueRef = useRef('');
  const [displayedDialogue, setDisplayedDialogue] = useState('');
  const fullDialogueRef = useRef('');
  const dialogueIndexRef = useRef(0);
  const isTypingRef = useRef(false);
  const [inventory, setInventory] = useState([]);
  const [collectedItems, setCollectedItems] = useState([]);
  const [showAttackButton, setShowAttackButton] = useState(false);
  const attackButtonBounds = useRef({ x: 400, y: 0, width: 160, height: 40 });
  const npcSpriteSheets = useRef({});

  const tileset = new Image();
  tileset.src = '/222.png';
  const spriteSheet = new Image();
  spriteSheet.src = '/hero.png';

  const CHARACTER_SPEED = 2;
  const SPRITE_ANIMATION_SPEED = 10;

  const npcs = [
    { x: 18 * TILE_SIZE, y: 4 * TILE_SIZE, map: 'tilemap1', type: 'npc', name: 'Mage Anna', dialogue: 'The rift is growing! I need a magical crystal from the western cave to seal it. Can you help?', hasTalked: false, frameX: 0, frameY: 0 },
    { x: 5 * TILE_SIZE, y: 6 * TILE_SIZE, map: 'tilemap1', type: 'npc', name: 'Blacksmith Ben', dialogue: 'Greetings! Have you spoken to Mage Anna? She needs a crystal to seal the rift.', hasTalked: false, itemToGive: { id: 2, name: 'Crystal Sword' }, frameX: 0, frameY: 0 },
    { x: 17 * TILE_SIZE, y: 12 * TILE_SIZE, map: 'tilemap3', type: 'boss', name: 'Rift Lord', health: 100, frameX: 0, frameY: 0 },
  ];

  useEffect(() => {
    characterRef.current.inventory = inventory;
  }, [inventory]);

  useEffect(() => {
    npcs.forEach(npc => {
      if (npc.spriteSrc && !npcSpriteSheets.current[npc.spriteSrc]) {
        const spriteSheet = new Image();
        spriteSheet.src = npc.spriteSrc;
        npcSpriteSheets.current[npc.spriteSrc] = spriteSheet;
      }
    });
  }, []);

  const setDialogueSync = (text) => {
    console.log('setDialogueSync called with text:', text);
    fullDialogueRef.current = text;
    dialogueIndexRef.current = 0;
    setDisplayedDialogue('');
    isTypingRef.current = true;

    const typeNextCharacter = () => {
      if (dialogueIndexRef.current < fullDialogueRef.current.length) {
        setDisplayedDialogue(fullDialogueRef.current.slice(0, dialogueIndexRef.current + 1));
        dialogueIndexRef.current += 1;
        console.log('Typing character:', fullDialogueRef.current[dialogueIndexRef.current - 1]);
        setTimeout(typeNextCharacter, 20);
      } else {
        isTypingRef.current = false;
        dialogueRef.current = fullDialogueRef.current;
        console.log('Finished typing dialogue:', fullDialogueRef.current);
      }
    };

    typeNextCharacter();
  };

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

    if (tileX < 0 || tileX >= 30 || tileY < 0 || tileY >= 20) {
      console.log(`Position (${tileX}, ${tileY}) is out of bounds`);
      return false;
    }

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

    const nearbyNPC = npcs.find(npc => 
      npc.map === currentMapRef.current &&
      adjacentTiles.some(tile => {
        const npcTileX = Math.floor(npc.x / TILE_SIZE);
        const npcTileY = Math.floor(npc.y / TILE_SIZE);
        const isAdjacent = npcTileX === tile.x && npcTileY === tile.y;
        return isAdjacent;
      })
    );

    if (nearbyNPC) {
      if (nearbyNPC.type === 'npc') {
        if (!isTypingRef.current && dialogueRef.current !== `[${nearbyNPC.name}] Press J to talk.`) {
          console.log('Showing NPC prompt:', `[${nearbyNPC.name}] Press J to talk.`);
          setDialogueSync(`[${nearbyNPC.name}] Press J to talk.`);
        }
        setShowAttackButton(false);
        if (keysRef.current.j && !keysRef.current.jPressed) {
          console.log('J pressed, starting dialogue for:', nearbyNPC.name);
          keysRef.current.jPressed = true;
          nearbyNPC.hasTalked = true;
          let dialogueText = `${nearbyNPC.name}: ${nearbyNPC.dialogue}`;

          if (nearbyNPC.name === 'Mage Anna') {
            if (inventory.some(item => item.id === 25)) {
              dialogueText = `${nearbyNPC.name}: Thank you for finding the crystal! Please take it to Blacksmith Ben to forge a weapon.`;
              setInventory(prev => prev.filter(item => item.id !== 25));
              nearbyNPC.dialogue = 'Hurry, the rift is growing stronger!';
              nearbyNPC.x = 22 * TILE_SIZE;
              nearbyNPC.y = 4 * TILE_SIZE;
            }
          } else if (nearbyNPC.name === 'Blacksmith Ben') {
            if (npcs[0].hasTalked && inventory.some(item => item.id === 25)) {
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

          if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current);
          dialogueTimerRef.current = setTimeout(() => {
            if (!isTypingRef.current) {
              console.log('Dialogue timer finished, resetting prompt for:', nearbyNPC.name);
              setDialogueSync(`[${nearbyNPC.name}] Press J to talk.`);
            }
          }, dialogueText.length * 50 + 2000);
        }
      } else if (nearbyNPC.type === 'boss') {
        if (!isTypingRef.current && dialogueRef.current !== `[${nearbyNPC.name}] Fight me!`) {
          console.log('Showing boss prompt:', `[${nearbyNPC.name}] Fight me!`);
          setDialogueSync(`[${nearbyNPC.name}] Fight me!`);
        }
        setShowAttackButton(true);
        if (keysRef.current.j && !keysRef.current.jPressed) {
          console.log('J pressed, attacking boss:', nearbyNPC.name);
          keysRef.current.jPressed = true;
          nearbyNPC.health -= 10;
          setDialogueSync(`You attack the monster!`);

          if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current);
          dialogueTimerRef.current = setTimeout(() => {
            if (nearbyNPC.health > 0) {
              characterRef.current.health -= 5;
              setDialogueSync(`Monster attacks back!`);
              dialogueTimerRef.current = setTimeout(() => {
                if (!isTypingRef.current) {
                  console.log('Boss dialogue timer finished, resetting prompt for:', nearbyNPC.name);
                  setDialogueSync(`[${nearbyNPC.name}] Fight me!`);
                }
              }, 2000 + 50 * `Monster attacks back!`.length);
            } else {
              setDialogueSync(`${nearbyNPC.name} defeated!`);
              nearbyNPC.health = 0;
              setShowAttackButton(false);
            }
          }, 2000 + 50 * `You attack the monster!`.length);
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
    const handleCanvasClick = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

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
          nearbyNPC.health -= 10;
          setDialogueSync(`You attack the monster!`);

          if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current);
          dialogueTimerRef.current = setTimeout(() => {
            if (nearbyNPC.health > 0) {
              characterRef.current.health -= 5;
              setDialogueSync(`Monster attacks back!`);
              dialogueTimerRef.current = setTimeout(() => {
                if (!isTypingRef.current) {
                  setDialogueSync(`[${nearbyNPC.name}] Fight me!`);
                }
              }, 2000 + 50 * `Monster attacks back!`.length);
            } else {
              setDialogueSync(`${nearbyNPC.name} defeated!`);
              nearbyNPC.health = 0;
              setShowAttackButton(false);
            }
          }, 2000 + 50 * `You attack the monster!`.length);
        }
      }
    };

    canvasRef.current.addEventListener('click', handleCanvasClick);
    return () => {
      canvasRef.current.removeEventListener('click', handleCanvasClick);
    };
  }, [showAttackButton]);

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

    const drawNPCs = () => {
      npcs.forEach(npc => {
        if (npc.map === currentMapRef.current && (npc.type === 'npc' || npc.health > 0)) {
          const spriteSheetToUse = npc.spriteSrc && npcSpriteSheets.current[npc.spriteSrc] ? npcSpriteSheets.current[npc.spriteSrc] : spriteSheet;
          if (!spriteSheetToUse.complete) return;

          const frameX = npc.frameX !== undefined ? npc.frameX : 0;
          const frameY = npc.frameY !== undefined ? npc.frameY : 2;
          const srcX = frameX * (SPRITE_WIDTH + BORDER_WIDTH + SPACING_WIDTH) + BORDER_WIDTH;
          const srcY = frameY * (SPRITE_HEIGHT + BORDER_WIDTH + SPACING_WIDTH) + BORDER_WIDTH;
          const offsetX = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;
          const offsetY = (TILE_SIZE - CHARACTER_DISPLAY_SIZE) / 2;

          const renderX = Math.round(npc.x + offsetX);
          const renderY = Math.round(npc.y + offsetY);

          ctx.drawImage(
            spriteSheetToUse,
            srcX, srcY,
            SPRITE_WIDTH, SPRITE_HEIGHT,
            renderX, renderY,
            CHARACTER_DISPLAY_SIZE, CHARACTER_DISPLAY_SIZE
          );
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

        const tileX = Math.floor(characterRef.current.x / TILE_SIZE);
        const tileY = Math.floor(characterRef.current.y / TILE_SIZE);
        const { overlay } = getCurrentMapData();
        const overlayTile = overlay[tileY][tileX];

        if (overlayTile && !collectedItems.includes(`${tileY}-${tileX}`)) {
          if (overlayTile === 25) {
            setInventory(prev => [...prev, { id: 25, name: 'Magical Crystal' }]);
            setCollectedItems(prev => [...prev, `${tileY}-${tileX}`]);
            setDialogueSync('You found the Magical Crystal!');
            overlay[tileY][tileX] = null;
          }
        }
      } else {
        characterRef.current.moving = false;
      }

      characterRef.current.frameCount += 1;
      if (isMoving && characterRef.current.frameCount % SPRITE_ANIMATION_SPEED === 0) {
        characterRef.current.frameX = (characterRef.current.frameX + 1) % 4;
      } else if (!isMoving) {
        characterRef.current.frameX = 0;
      }

      checkMapTransition();
      checkInteraction();
    };

    const drawHealthBars = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(50, 50, 200, 30);
      ctx.fillStyle = 'red';
      const playerHealthWidth = (characterRef.current.health / 100) * 180;
      ctx.fillRect(60, 60, playerHealthWidth, 10);
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText(`Player HP: ${characterRef.current.health}`, 60, 75);

      const nearbyBoss = npcs.find(npc => 
        npc.map === currentMapRef.current &&
        npc.type === 'boss' &&
        Math.abs(Math.floor(characterRef.current.x / TILE_SIZE) - Math.floor(npc.x / TILE_SIZE)) <= 1 &&
        Math.abs(Math.floor(characterRef.current.y / TILE_SIZE) - Math.floor(npc.y / TILE_SIZE)) <= 1
      );

      if (nearbyBoss && nearbyBoss.health > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(710, 50, 200, 30);
        ctx.fillStyle = 'red';
        const bossHealthWidth = (nearbyBoss.health / 100) * 180;
        ctx.fillRect(720, 60, bossHealthWidth, 10);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`Boss HP: ${nearbyBoss.health}`, 720, 75);
      }
    };

    const drawDialogue = () => {
      if (!ctx) {
        console.error('Canvas context (ctx) is not defined in drawDialogue');
        return;
      }

      let dialogueBoxHeight = 0;

      if (displayedDialogue) {
        console.log('Drawing dialogue:', displayedDialogue);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(50, 400, 860, 100);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(displayedDialogue, 60, 440);
        dialogueBoxHeight += 100;
      }

      if (showAttackButton) {
        attackButtonBounds.current.y = 400 + dialogueBoxHeight;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fillRect(attackButtonBounds.current.x, attackButtonBounds.current.y, attackButtonBounds.current.width, attackButtonBounds.current.height);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Attack (J)', attackButtonBounds.current.x + 30, attackButtonBounds.current.y + 28);
        dialogueBoxHeight += 50;
      }

      if (inventory.length > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(50, 400 + dialogueBoxHeight, 860, 60);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Inventory: ' + inventory.map(item => item.name).join(', '), 60, 430 + dialogueBoxHeight);
      }
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawTilemap();
      drawNPCs();
      updateCharacter();
      drawCharacter(characterRef.current.x, characterRef.current.y, characterRef.current.frameX, characterRef.current.frameY);

      if (transitioningRef.current) {
        ctx.fillStyle = `rgba(0, 0, 0, ${transitionAlphaRef.current})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        updateTransition();
      }

      drawHealthBars();
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
  }, [displayedDialogue]);

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