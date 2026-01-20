import { state } from './state.js';
import { SETTINGS, COLORS } from './config.js';
import { createPopup } from './entities.js';
import { updateAllMultipliers, getSlotVisuals } from './ui.js';

// 角度随机扰动
function applyPerturbation(ball) {
    const vel = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    const angle = Math.atan2(ball.vy, ball.vx);
    const offset = ((Math.random() * 2 - 1) * SETTINGS.perturbationDeg) * (Math.PI / 180);
    ball.vx = Math.cos(angle + offset) * vel;
    ball.vy = Math.sin(angle + offset) * vel;
}

// 矩形碰撞
function checkRect(ball, rect) {
    const dx = ball.x - rect.x;
    const dy = ball.y - rect.y;
    const cos = Math.cos(-rect.angle);
    const sin = Math.sin(-rect.angle);
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;
    const hw = rect.width / 2, hh = rect.height / 2;
    const cx = Math.max(-hw, Math.min(hw, lx));
    const cy = Math.max(-hh, Math.min(hh, ly));
    const dist = Math.sqrt((lx - cx) ** 2 + (ly - cy) ** 2);

    if (dist < ball.r) {
        const nxLoc = dist === 0 ? 0 : (lx - cx) / dist;
        const nyLoc = dist === 0 ? 0 : (ly - cy) / dist;
        const nx = nxLoc * Math.cos(rect.angle) - nyLoc * Math.sin(rect.angle);
        const ny = nxLoc * Math.sin(rect.angle) + nyLoc * Math.cos(rect.angle);
        return { hit: true, nx, ny, overlap: ball.r - dist };
    }
    return { hit: false };
}

// 球体互斥
function resolveBallCollisions() {
    const { balls, currentPhysics } = state;
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const b1 = balls[i], b2 = balls[j];
            const dx = b2.x - b1.x, dy = b2.y - b1.y;
            const distSq = dx * dx + dy * dy;
            const minDist = b1.r + b2.r;

            if (distSq < minDist * minDist) {
                const dist = Math.sqrt(distSq);
                const nx = dx / dist, ny = dy / dist;
                const overlap = minDist - dist;
                b1.x -= nx * overlap * 0.5; b1.y -= ny * overlap * 0.5;
                b2.x += nx * overlap * 0.5; b2.y += ny * overlap * 0.5;

                const rvx = b2.vx - b1.vx, rvy = b2.vy - b1.vy;
                const vDotN = rvx * nx + rvy * ny;
                if (vDotN < 0) {
                    const impulse = (2 * vDotN) / 2; // m1=m2
                    const bounce = currentPhysics.ballBounciness;
                    b1.vx -= impulse * nx * bounce; b1.vy -= impulse * ny * bounce;
                    b2.vx += impulse * nx * bounce; b2.vy += impulse * ny * bounce;
                }
            }
        }
    }
}

export function updatePhysics() {
    const phys = state.currentPhysics;
    state.worldRotation += phys.rotationSpeed;

    // 更新位置
    state.obstacles.forEach(o => {
        const a = o.baseAngle + state.worldRotation + (o.orbitSpeed * 10);
        o.x = state.centerX + Math.cos(a) * o.dist;
        o.y = state.centerY + Math.sin(a) * o.dist;
    });
    state.slots.forEach(s => {
        const a = s.baseAngle + state.worldRotation;
        s.x = state.centerX + Math.cos(a) * s.dist;
        s.y = state.centerY + Math.sin(a) * s.dist;
    });
    state.barriers.forEach(b => {
        const ps = state.slots[b.slotIndex];
        const a = b.offsetAngle + state.worldRotation * 2;
        b.x = ps.x + Math.cos(a) * b.orbitDist;
        b.y = ps.y + Math.sin(a) * b.orbitDist;
        b.angle = a + Math.PI / 2;
    });

    resolveBallCollisions();

    // 弹珠循环
    for (let i = 0; i < state.balls.length; i++) {
        const b = state.balls[i];
        b.vx *= 0.999; // 空气阻力
        b.vy *= 0.999;
        b.vy += phys.gravity;
        b.x += b.vx;
        b.y += b.vy;

        let handled = false;

        // 1. 得分区
        for (let s of state.slots) {
            const dx = b.x - s.x, dy = b.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < s.r + b.r) {
                const reward = s.multiplier * state.multiplier;
                state.score += reward;
                state.inventory += reward;
                createPopup(s.x, s.y, `+${reward} AMMO`, getSlotVisuals(s.multiplier).color);
                state.balls.splice(i, 1);
                i--;
                updateAllMultipliers();
                handled = true;
                break;
            }
        }
        if (handled) continue;

        // 2. 挡板
        for (let rect of state.barriers) {
            const col = checkRect(b, rect);
            if (col.hit) {
                const vdotn = b.vx * col.nx + b.vy * col.ny;
                if (vdotn < 0) {
                    b.vx -= 2 * vdotn * col.nx * 0.7;
                    b.vy -= 2 * vdotn * col.ny * 0.7;
                    b.x += col.nx * col.overlap;
                    b.y += col.ny * col.overlap;
                }
            }
        }

        // 3. 边界与虚空
        const distC = Math.sqrt((b.x - state.centerX) ** 2 + (b.y - state.centerY) ** 2);
        if (distC > state.arenaRadius - b.r) {
            const angle = Math.atan2(b.y - state.centerY, b.x - state.centerX);
            let normA = (angle + Math.PI * 2) % (Math.PI * 2);
            if (normA > state.voidZone.start && normA < state.voidZone.end) {
                createPopup(b.x, b.y, `LOST`, '#ef4444');
                state.balls.splice(i, 1);
                i--;
                updateAllMultipliers();
                continue;
            }
            const nx = (state.centerX - b.x) / distC;
            const ny = (state.centerY - b.y) / distC;
            const vdotn = b.vx * nx + b.vy * ny;
            b.vx -= 2 * vdotn * nx * phys.edgeBounciness;
            b.vy -= 2 * vdotn * ny * phys.edgeBounciness;
            b.x += nx * (distC - (state.arenaRadius - b.r));
            b.y += ny * (distC - (state.arenaRadius - b.r));
            applyPerturbation(b);
        }

        // 4. 障碍物
        for (let o of state.obstacles) {
            const dx = b.x - o.x, dy = b.y - o.y;
            const distSq = dx * dx + dy * dy;
            const minD = b.r + o.r;
            if (distSq < minD * minD) {
                const dist = Math.sqrt(distSq);
                const nx = dx / dist, ny = dy / dist;
                const vdotn = b.vx * nx + b.vy * ny;
                if (vdotn < 0) {
                    b.vx -= 2 * vdotn * nx * phys.obstacleBounciness;
                    b.vy -= 2 * vdotn * ny * phys.obstacleBounciness;
                    b.x = o.x + nx * minD;
                    b.y = o.y + ny * minD;
                    o.flash = 5;
                    applyPerturbation(b);
                }
            }
        }
    }
}