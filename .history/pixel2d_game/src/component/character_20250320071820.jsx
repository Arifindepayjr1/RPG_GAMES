import { SPRITE_WIDTH, SPRITE_HEIGHT, BORDER_WIDTH, SPACING_WIDTH, CHARACTER_DISPLAY_SIZE, CHARACTER_SPEED, TILE_SIZE } from '../constants';

// Utility function, not a React component
const Character = ({ ctx, map, overlayLayer, secondOverlayLayer, isWalkable, checkMapTransition, currentMap }) => {
  const spriteSheet = new Image();
  spriteSheet.src = "./asset/assets/hero.png";

  // Initial character state (no useState)
  let character = {
    x: 0,
    y: 0,
    frameX: 0,
    frameY: 2, // Default: facing down
    frameCount: 0,
    direction: 'down',
    isFighting: false,
    moving: false
  };

  // Initial keys state (no useState)
  let keys = { w: false, s: false, a: false, d: false, j: false };

  // Initialize position based on URL params or defaults
  const initializePosition = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const spawnRow = parseInt(urlParams.get('spawnRow')) || (currentMap === 'tilemap1' ? 15 : currentMap === 'tilemap2' ? 4 : 8);
    const spawnCol = parseInt(urlParams.get('spawnCol')) || (currentMap === 'tilemap1' ? 0 : currentMap === 'tilemap2' ? 12 : 3);
    character.x = spawnCol * TILE_SIZE;
    character.y = spawnRow * TILE_SIZE;
  };

  // Set up event listeners (replaces useEffect)
  const handleKeyDown = (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) {
      keys[key] = true;
    }
    if (key === 'j' && !character.isFighting) {
      character.isFighting = true;
      character.frameY = 6;
      character.frameX = 0;
    }
  };

  const handleKeyUp = (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) {
      keys[key] = false;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // Cleanup function to remove event listeners (called manually if needed)
  const cleanup = () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };

  // Initialize character position on load
  initializePosition();

  const updateAnimation = (isMoving) => {
    character.frameCount += 1;
    let newFrameX = character.frameX;

    if (character.isFighting) {
      if (character.frameCount % 10 === 0) {
        newFrameX = (newFrameX + 1) % 4;
        character.frameX = newFrameX;
        character.isFighting = newFrameX !== 0; // End fighting when animation completes
      }
    } else if (isMoving && character.frameCount % 5 === 0) {
      newFrameX = (newFrameX + 1) % 4;
      character.frameX = newFrameX;
    } else if (!isMoving) {
      character.frameX = 0;
    }
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
      character.x = newX;
      character.y = newY;
      character.moving = true;
    } else {
      character.moving = false;
    }

    updateAnimation(isMoving);
    checkMapTransition(character.x, character.y);
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

  // Return the functions for the game loop, plus cleanup for tilemap to call
  return { updateCharacter, drawCharacter, cleanup };
};

export default Character;