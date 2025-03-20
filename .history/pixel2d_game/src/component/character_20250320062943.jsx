import { useEffect, useRef, useState } from "react";

const SPRITE_WIDTH = 64;
const SPRITE_HEIGHT = 64;
const BORDER_WIDTH = 2;
const SPACING_WIDTH = 2;
const CHARACTER_DISPLAY_SIZE = 96;
const CHARACTER_SPEED = 4; // Move 4 pixels per frame
const TRANSITION_COOLDOWN = 1000; // 1 second

const blockingBaseTiles = [1, 2, 3, 4, 5, 6, 7, 8, 13, 16, 21, 22, 23, 31, 32, 36, 57, 59, 60, 77, 89];
const blockingItemIDs = [25, 26, 27, 28, 33, 35, 37, 40, 41, 42, 43, 45, 46, 48, 49, 54, 55, 56, 58, 60, 61, 62, 77];

const Character = ({ ctx, tileSize, map, overlayLayer, secondOverlayLayer, currentMap, drawMap }) => {
    const spriteSheet = useRef(new Image());
    const lastTransitionTime = useRef(0);
    const [character, setCharacter] = useState({
        x: 0,
        y: 0,
        frameX: 0,
        frameY: 2,
        direction: "down",
        isFighting: false,
        moving: false,
    });
    const [keys, setKeys] = useState({ w: false, s: false, a: false, d: false, j: false });
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        spriteSheet.current.src = "./asset/assets/hero.png";
        spriteSheet.current.onload = () => {
            console.log("Sprite sheet loaded");
            drawMap();
        };
    }, [drawMap]);

    const isWalkable = (x, y) => {
        const tileX = Math.floor(x / tileSize);
        const tileY = Math.floor(y / tileSize);
        if (tileX < 0 || tileX >= 30 || tileY < 0 || tileY >= 20) return false;

        return (
            !blockingBaseTiles.includes(map[tileY][tileX]) &&
            (!overlayLayer[tileY][tileX] || !blockingItemIDs.includes(overlayLayer[tileY][tileX])) &&
            (!secondOverlayLayer[tileY][tileX] || !blockingItemIDs.includes(secondOverlayLayer[tileY][tileX]))
        );
    };

    const checkMapTransition = () => {
        const tileX = Math.floor(character.x / tileSize);
        const tileY = Math.floor(character.y / tileSize);
        const currentTime = Date.now();
        if (currentTime - lastTransitionTime.current < TRANSITION_COOLDOWN) return;

        let newMap = null;
        if (currentMap === "tilemap1" && tileY === 2 && tileX === 24) newMap = "tilemap2.html?spawnRow=4&spawnCol=12";
        else if (currentMap === "tilemap1" && tileY === 19 && tileX === 14) newMap = "tilemap3.html?spawnRow=8&spawnCol=3";
        else if (currentMap === "tilemap2" && tileY === 3 && tileX === 12) newMap = "index.html?spawnRow=3&spawnCol=24";

        if (newMap) {
            lastTransitionTime.current = currentTime;
            setIsTransitioning(true);
            setTimeout(() => (window.location.href = newMap), 500);
        }
    };

    const updateCharacter = () => {
        let newX = character.x;
        let newY = character.y;
        let moving = false;

        if (keys.w) { newY -= CHARACTER_SPEED; moving = true; }
        if (keys.s) { newY += CHARACTER_SPEED; moving = true; }
        if (keys.a) { newX -= CHARACTER_SPEED; moving = true; }
        if (keys.d) { newX += CHARACTER_SPEED; moving = true; }

        if (!character.isFighting && moving && isWalkable(newX, newY)) {
            setCharacter((prev) => ({ ...prev, x: newX, y: newY, moving }));
        } else {
            setCharacter((prev) => ({ ...prev, moving: false }));
        }
        checkMapTransition();
    };

    const drawCharacter = () => {
        if (!ctx || !spriteSheet.current.complete) return;

        const srcX = character.frameX * (SPRITE_WIDTH + BORDER_WIDTH + SPACING_WIDTH) + BORDER_WIDTH;
        const srcY = character.frameY * (SPRITE_HEIGHT + BORDER_WIDTH + SPACING_WIDTH) + BORDER_WIDTH;
        const offsetX = (tileSize - CHARACTER_DISPLAY_SIZE) / 2;
        const offsetY = (tileSize - CHARACTER_DISPLAY_SIZE) / 2;

        ctx.drawImage(
            spriteSheet.current,
            srcX, srcY,
            SPRITE_WIDTH, SPRITE_HEIGHT,
            character.x + offsetX, character.y + offsetY,
            CHARACTER_DISPLAY_SIZE, CHARACTER_DISPLAY_SIZE
        );
    };

    useEffect(() => {
        const handleKeyDown = (e) => setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));
        const handleKeyUp = (e) => setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    useEffect(() => {
        const gameLoop = () => {
            updateCharacter();
            drawMap();
            drawCharacter();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }, [character, keys]);

    return null;
};

export default Character;
