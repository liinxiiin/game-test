import { state } from './state.js';
import { formatNumber } from './utils.js';
import { PHYSICS_PRESETS } from './config.js';

export function updateHUD() {
    document.getElementById('current-score-display').innerText = formatNumber(state.score, 0);
    document.getElementById('ammo-display').innerText = formatNumber(state.inventory, 0);
    
    const btn = document.getElementById('upgrade-multiplier-btn');
    document.getElementById('multiplier-text').innerText = `${state.multiplier}X`;
    
    const cost = state.multiplier * 2;
    if (cost > state.inventory) {
        btn.disabled = true;
        document.getElementById('multiplier-hint').innerText = "余量不足";
        document.getElementById('multiplier-hint').classList.add('text-red-500');
    } else {
        btn.disabled = false;
        document.getElementById('multiplier-hint').innerText = "点击翻倍消耗";
        document.getElementById('multiplier-hint').classList.remove('text-red-500');
    }
}

export function updateAllMultipliers() {
    state.slots.forEach(s => {
        const r = Math.random();
        if (r < 0.25) s.multiplier *= 2;
        else if (r >= 0.75) s.multiplier = 1;
        if (s.multiplier > 64) s.multiplier = 64;
    });
}

export function getSlotVisuals(m) {
    if (m >= 16) return { color: '#f43f5e', label: `${m}X` };
    if (m >= 4) return { color: '#a855f7', label: `${m}X` };
    return { color: '#eab308', label: m > 1 ? `${m}X` : '1X' };
}

export function selectType(type) {
    state.selectedType = type;
    document.querySelectorAll('.type-icon').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    const preset = PHYSICS_PRESETS[type];
    // 浅拷贝更新物理参数
    Object.assign(state.currentPhysics, preset);
}

export function toggleStats() {
    state.isStatsOpen = !state.isStatsOpen;
    const p = document.getElementById('stats-panel');
    state.isStatsOpen ? p.classList.remove('hidden-panel') : p.classList.add('hidden-panel');
}