import { state } from './state.js';
import { COLORS } from './config.js';

export function spawnBall() {
    let color = COLORS[state.selectedType] || COLORS.earth;
    
    state.balls.push({
        x: state.centerX,
        y: state.centerY - state.arenaRadius + 35,
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

    // 1. 障碍物层级
    const layers = [
        { radius: state.arenaRadius * 0.15, count: 6, obsR: 8, speed: 0.006 },
        { radius: state.arenaRadius * 0.28, count: 8, obsR: 7, speed: 0.005 },
        { radius: state.arenaRadius * 0.40, count: 12, obsR: 6, speed: -0.004 },
        { radius: state.arenaRadius * 0.52, count: 16, obsR: 5, speed: 0.0035 },
        { radius: state.arenaRadius * 0.65, count: 20, obsR: 5, speed: -0.0025 },
        { radius: state.arenaRadius * 0.78, count: 24, obsR: 4, speed: 0.002 },
        { radius: state.arenaRadius * 0.90, count: 36, obsR: 3.5, speed: -0.0015 }
    ];

    layers.forEach((layer, idx) => {
        for (let i = 0; i < layer.count; i++) {
            const startAngle = (i / layer.count) * Math.PI * 2;
            state.obstacles.push({
                baseAngle: startAngle,
                dist: layer.radius,
                r: layer.obsR,
                orbitSpeed: layer.speed,
                color: idx % 2 === 0 ? COLORS.obstacle1 : COLORS.obstacle2,
                flash: 0,
                x: 0, y: 0
            });
        }
    });

    // 2. 得分区与挡板
    const slotCount = 3;
    const slotDist = 70;
    for (let i = 0; i < slotCount; i++) {
        const baseAngle = (i / slotCount) * Math.PI * 2 - Math.PI / 2;
        state.slots.push({
            baseAngle,
            dist: slotDist,
            r: 25,
            multiplier: 1,
            x: 0, y: 0
        });

        for (let j = 0; j < 6; j++) {
            state.barriers.push({
                slotIndex: i,
                offsetAngle: (j / 6) * Math.PI * 2,
                orbitDist: 44,
                width: 24,
                height: 5,
                x: 0, y: 0,
                angle: 0
            });
        }
    }

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