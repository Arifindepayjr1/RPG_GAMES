// Remove the old character state and updateCharacter function
// Add this inside useEffect after setting up scale and offset:
const isWalkable = (x, y) => {
  const tileX = Math.floor(x / TILE_SIZE);
  const tileY = Math.floor(y / TILE_SIZE);
  if (tileX < 0 || tileX >= 30 || tileY < 0 || tileY >= 20) return false;

  const baseTile = map[tileY][tileX];
  const overlayTile = overlayLayer[tileY][tileX];
  const secondOverlayTile = secondOverlayLayer[tileY][tileX];

  return !(
    blockingBaseTiles.includes(baseTile) ||
    (overlayTile && blockingItemIDs.includes(overlayTile)) ||
    (secondOverlayTile && blockingItemIDs.includes(secondOverlayTile))
  );
};

const checkMapTransition = (position) => {
  const tileX = Math.floor(position.x / TILE_SIZE);
  const tileY = Math.floor(position.y / TILE_SIZE);
  const currentTime = Date.now();
  const lastTransitionTime = window.lastTransitionTime || 0;

  if (currentTime - lastTransitionTime < 1000) return;

  if (tileY === 3 && tileX === 12) {
    onMapTransition("tilemap1", 24 * TILE_SIZE, 3 * TILE_SIZE);
    window.lastTransitionTime = currentTime;
  }
};

const character = Character({
  initialPos: characterPos,
  onPositionUpdate: checkMapTransition,
  isWalkable,
  scale,
  offsetX,
  offsetY,
});

// Update draw function to use character.render(ctx) instead of manual drawing