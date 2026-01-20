/**
 * 格式化大数值 (K, M, B)
 */
export function formatNumber(num, decimals = 2) {
    if (num < 1000) return num.toFixed(decimals);
    const units = ['K', 'M', 'B', 'T', 'P'];
    let unitIndex = -1;
    let tempNum = num;
    while (tempNum >= 1000 && unitIndex < units.length - 1) {
        tempNum /= 1000;
        unitIndex++;
    }
    return tempNum.toFixed(2) + units[unitIndex];
}

export function distSq(x1, y1, x2, y2) {
    return (x1 - x2) ** 2 + (y1 - y2) ** 2;
}

export function rotatePoint(x, y, cx, cy, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = x - cx;
    const dy = y - cy;
    return {
        x: cx + dx * cos - dy * sin,
        y: cy + dx * sin + dy * cos
    };
}