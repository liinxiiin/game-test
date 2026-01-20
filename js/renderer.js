import { state } from './state.js';
import { getSlotVisuals } from './ui.js';
import { COLORS } from './config.js';

export function render(ctx, chartCtx, canvas, chartCanvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景
    ctx.beginPath();
    ctx.arc(state.centerX, state.centerY, state.arenaRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // 虚空线
    ctx.beginPath();
    ctx.arc(state.centerX, state.centerY, state.arenaRadius, state.voidZone.start, state.voidZone.end);
    ctx.strokeStyle = COLORS.voidStroke;
    ctx.lineWidth = 6;
    ctx.stroke();

    // 槽位
    state.slots.forEach(s => {
        const vis = getSlotVisuals(s.multiplier);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = vis.color + '22';
        ctx.fill();
        ctx.strokeStyle = vis.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = vis.color;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(vis.label, s.x, s.y + 4);
    });

    // 挡板
    state.barriers.forEach(b => {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);
        ctx.fillStyle = COLORS.barrier;
        ctx.strokeStyle = COLORS.barrierStroke;
        ctx.lineWidth = 1;
        ctx.fillRect(-b.width / 2, -b.height / 2, b.width, b.height);
        ctx.strokeRect(-b.width / 2, -b.height / 2, b.width, b.height);
        ctx.restore();
    });

    // 发射器
    ctx.save();
    ctx.translate(state.centerX, state.centerY - state.arenaRadius + 20);
    ctx.rotate(-state.launcherAngle);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-10, 0, 20, 30);
    // 蓄能条
    const charge = state.autoFireTimer / state.currentPhysics.autoFireLimit;
    ctx.fillStyle = `rgba(234, 179, 8, 0.9)`;
    ctx.fillRect(-8, 30, 16, -30 * charge);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(-10, 0, 20, 30);
    ctx.restore();

    // 障碍物
    state.obstacles.forEach(o => {
        ctx.fillStyle = o.flash > 0 ? '#fff' : o.color;
        if (o.flash > 0) o.flash--;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
    });

    // 弹珠
    state.balls.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.shadowBlur = 4;
        ctx.shadowColor = b.color;
    });
    ctx.shadowBlur = 0;

    // 浮动文字
    for (let i = state.popups.length - 1; i >= 0; i--) {
        const p = state.popups[i];
        p.life -= 0.02;
        p.dy -= 0.5;
        if (p.life <= 0) {
            state.popups.splice(i, 1);
            continue;
        }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(p.text, p.x, p.y + p.dy);
    }
    ctx.globalAlpha = 1.0;

    // 图表绘制
    if (state.isStatsOpen) drawChart(chartCtx, chartCanvas);
}

function drawChart(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const maxVal = Math.max(...state.history, 10);
    const stepX = canvas.width / (state.history.length - 1);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 4; i++) {
        const y = canvas.height - (i / 4 * canvas.height);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    state.history.forEach((val, i) => {
        const x = i * stepX;
        const y = canvas.height - (val / maxVal * canvas.height * 0.8) - 10;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
}