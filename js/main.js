import { state } from './state.js';
import { INPUT, setupInputs } from './input.js';
import { initLevel, spawnBall } from './entities.js';
import { updatePhysics } from './physics.js';
import { render } from './js/renderer.js';
import { updateHUD } from './ui.js';
import { formatNumber } from './utils.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const chartCanvas = document.getElementById('chartCanvas');
const chartCtx = chartCanvas.getContext('2d');

function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    // 重新校准中心点
    if(state.running) {
        state.centerX = canvas.width / 2;
        state.centerY = canvas.height / 2;
        state.arenaRadius = (canvas.width / 2) - 5;
        // 重新初始化关卡位置
        initLevel();
    }
}

function gameOver() {
    state.running = false;
    document.getElementById('menu-overlay').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('game-over-text').classList.remove('hidden');
}

function updateGame() {
    if (!state.running) return;

    // 输入处理
    if (INPUT.left) state.launcherAngle = Math.max(-1.4, state.launcherAngle - 0.05);
    if (INPUT.right) state.launcherAngle = Math.min(1.4, state.launcherAngle + 0.05);

    // 自动发射逻辑
    state.autoFireTimer++;
    const limit = state.currentPhysics.autoFireLimit;
    if (state.autoFireTimer >= limit) {
        if (state.inventory >= state.multiplier) {
            spawnBall();
            state.inventory -= state.multiplier;
            state.totalFiredRaw++;
        }
        state.autoFireTimer = 0;
    }

    // 手动发射
    if (INPUT.fire && state.cooldown <= 0 && state.inventory >= state.multiplier) {
        spawnBall();
        state.inventory -= state.multiplier;
        state.totalFiredRaw++;
        state.cooldown = state.currentPhysics.cooldown;
        state.autoFireTimer = 0; // 重置自动计时
    }
    if (state.cooldown > 0) state.cooldown--;

    // 统计采样
    state.statsTimer++;
    if (state.statsTimer > 120) {
        const baseEff = state.totalFiredRaw > 0 ? (state.score / state.totalFiredRaw) : 0;
        const dynamicEff = baseEff * state.multiplier;
        state.history.push(dynamicEff);
        if (state.history.length > 20) state.history.shift();
        state.statsTimer = 0;
        document.getElementById('current-efficiency-text').innerText = `EFF: ${formatNumber(dynamicEff)}`;
    }

    // 物理更新
    updatePhysics();

    // 游戏结束判定
    if (state.inventory < state.multiplier && state.balls.length === 0) {
        gameOver();
    }

    updateHUD();
}

function loop() {
    updateGame();
    render(ctx, chartCtx, canvas, chartCanvas);
    requestAnimationFrame(loop);
}

// 启动
window.addEventListener('resize', resize);
setupInputs();
resize();
loop(); // 启动循环，等待 running=true