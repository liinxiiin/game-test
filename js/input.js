import { state } from './state.js';
import { spawnBall } from './entities.js';
import { updateHUD, selectType, toggleStats } from './ui.js';

export const INPUT = { left: false, right: false, fire: false };

export function setupInputs() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') INPUT.left = true;
        if (e.key === 'ArrowRight') INPUT.right = true;
        if (e.key === ' ') INPUT.fire = true;
        if (e.key === '1') selectType('earth');
        if (e.key === '2') selectType('moon');
        if (e.key === '3') selectType('comet');
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') INPUT.left = false;
        if (e.key === 'ArrowRight') INPUT.right = false;
        if (e.key === ' ') INPUT.fire = false;
    });

    // 按钮绑定
    document.getElementById('start-btn').onclick = () => {
        const c = document.getElementById('gameCanvas');
        state.reset(c.width, c.height);
        import('./entities.js').then(m => m.initLevel()); // 延迟加载实体
        updateHUD();
        document.getElementById('menu-overlay').classList.add('opacity-0', 'pointer-events-none');
    };

    document.getElementById('upgrade-multiplier-btn').onclick = () => {
        const next = state.multiplier * 2;
        if (next <= state.inventory) {
            state.multiplier = next;
            updateHUD();
        }
    };

    document.getElementById('stats-toggle-btn').onclick = toggleStats;
    document.getElementById('close-stats-btn').onclick = toggleStats;

    // 类型点击绑定
    document.querySelectorAll('.type-icon').forEach(icon => {
        icon.onclick = () => selectType(icon.dataset.type);
    });
}