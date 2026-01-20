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
        document.getElementById('multiplier-hint').innerText = "点击翻倍";
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
    if (m >= 1024) return { color: '#ff4f00', label: `${m}X`, text: `LEGENDARY ${m}!!!` };
    if (m >= 256) return { color: '#ffff15', label: `${m}X`, text: `AMAZING ${m}!!` };
    if (m >= 64) return { color: '#9e0e8d', label: `${m}X`, text: `EXECELLENT ${m}!` };
    if (m >= 16) return { color: '#3fa9f4', label: `${m}X`, text: `NICE ${m}` };
    if (m >= 4) return { color: '#54f061', label: `${m}X`, text: `GOOD ${m}` };
    return { color: '#07efe7', label: m > 1 ? `${m}X` : '1X', text: `${m}` };
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