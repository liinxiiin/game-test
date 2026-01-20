import { state } from './state.js';
import { COLORS } from './config.js';

export function spawnBall() {
    let color = COLORS[state.selectedType] || COLORS.earth;
    
    state.balls.push({
        x: state.centerX,
        y: state.centerY - state.arenaRadius + 20,
        vx: Math.sin(state.launcherAngle) * state.currentPhysics.initialSpeed,
        vy: Math.cos(state.launcherAngle) * state.currentPhysics.initialSpeed,
        r: state.currentPhysics.ballRadius,
        color: color
    });
}

export function initLevel() {
    state.obstacles = [];
    state.slots = [];
    state.barriers = [];

    // 1. Initialize Slots and Barriers first to define exclusion zones
    const slotCount = 3;
    const slotDist = 70;
    for (let i = 0; i < slotCount; i++) {
        const baseAngle = (i / slotCount) * Math.PI * 2 - Math.PI / 6;
        
        // Add Slot
        const slot = {
            baseAngle,
            dist: slotDist,
            r: 15,
            multiplier: 1,
            x: state.centerX + Math.cos(baseAngle) * slotDist, 
            y: state.centerY + Math.sin(baseAngle) * slotDist
        };
        state.slots.push(slot);

        // Add Barriers associated with this slot
        for (let j = 0; j < 6; j++) {
            const offsetAngle = (j / 6) * Math.PI * 2;
            state.barriers.push({
                slotIndex: i,
                offsetAngle: offsetAngle,
                orbitDist: 35,
                orbitSpeed: 1,
                width: 24,
                height: 5,
                x: 0, y: 0, // Calculated during physics update
                angle: 0
            });
        }

        // Add Barriers associated with this slot
        for (let j = 0; j < 8; j++) {
            const offsetAngle = (j / 8) * Math.PI * 2;
            state.barriers.push({
                slotIndex: i,
                offsetAngle: offsetAngle,
                orbitDist: 55,
                orbitSpeed: -2,
                width: 12,
                height: 3,
                x: 0, y: 0, // Calculated during physics update
                angle: 0
            });
        }
    }

    // 2. Obstacle layers definition
    const layers = [
        { radius: state.arenaRadius * 0.00, count: 1, obsR: 10, speed: 0.0 },
        // { radius: state.arenaRadius * 0.10, count: 6, obsR: 5, speed: 0.6 },
        { radius: state.arenaRadius * 0.3, count: 12, obsR: 15, speed: 0.5 },
        { radius: state.arenaRadius * 0.40, count: 20, obsR: 6, speed: -1 },
        { radius: state.arenaRadius * 0.55, count: 20, obsR: 7, speed: 0.35 },
        { radius: state.arenaRadius * 0.65, count: 30, obsR: 8, speed: -0.25 },
        { radius: state.arenaRadius * 0.75, count: 40, obsR: 5, speed: 0.2 },
        { radius: state.arenaRadius * 0.95, count: 30, obsR: 4, speed: -0.15 }
    ];

    layers.forEach((layer, idx) => {
        for (let i = 0; i < layer.count; i++) {
            const startAngle = (i / layer.count) * Math.PI * 2;
            
            // Calculate initial positions to check for overlap
            const obsX = state.centerX + Math.cos(startAngle) * layer.radius;
            const obsY = state.centerY + Math.sin(startAngle) * layer.radius;

            // Collision Check: Avoid overlap with Slots
            let overlaps = false;
            for (const slot of state.slots) {
                const dx = obsX - slot.x;
                const dy = obsY - slot.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                // Buffer of 5px to ensure visual spacing
                if (dist < (layer.obsR + slot.r + 5)) {
                    overlaps = true;
                    break;
                }
            }

            // Collision Check: Avoid overlap with Barriers (estimated orbit zone)
            if (!overlaps) {
                for (const slot of state.slots) {
                    const dx = obsX - slot.x;
                    const dy = obsY - slot.y;
                    const distFromSlotCenter = Math.sqrt(dx * dx + dy * dy);
                    // Barrier orbit is 35px from slot center, width/2 is 12px
                    const barrierInner = 35 - 15;
                    const barrierOuter = 35 + 15;
                    if (distFromSlotCenter > barrierInner && distFromSlotCenter < barrierOuter) {
                        overlaps = true;
                        break;
                    }
                }
            }

            if (!overlaps) {
                state.obstacles.push({
                    baseAngle: startAngle,
                    dist: layer.radius,
                    r: layer.obsR,
                    orbitSpeed: layer.speed,
                    color: idx % 2 === 0 ? COLORS.obstacle1 : COLORS.obstacle2,
                    flash: 0,
                    x: obsX, 
                    y: obsY
                });
            }
        }
    });

    state.voidZone = {
        start: Math.PI * 0.5 - 0.5,
        end: Math.PI * 0.5 + 0.5
    };
}

export function createPopup(x, y, text, color) {
    state.popups.push({
        x, y, text, color, life: 1.0, dy: 0
    });
}