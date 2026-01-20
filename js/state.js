import { PHYSICS_PRESETS } from './config.js';

/**
 * 全局状态单例
 */
export const state = {
    // 游戏循环控制
    running: false,
    
    // 实体容器
    balls: [],
    obstacles: [],
    slots: [],
    barriers: [],
    popups: [], // 浮动文字
    
    // 玩家数据
    score: 0,
    inventory: 100,
    multiplier: 1,
    totalFiredRaw: 0, // 基础发射次数（用于统计）
    
    // 物理与世界状态
    launcherAngle: 0,
    worldRotation: 0,
    autoFireTimer: 0,
    cooldown: 0,
    
    // 场景几何
    centerX: 0,
    centerY: 0,
    arenaRadius: 0,
    voidZone: { start: 0, end: 0 },
    
    // 选项与模式
    selectedType: 'earth',
    currentPhysics: { ...PHYSICS_PRESETS.earth },
    
    // 统计数据
    history: Array(20).fill(0),
    statsTimer: 0,
    isStatsOpen: false,

    // 重置游戏
    reset(width, height) {
        this.centerX = width / 2;
        this.centerY = height / 2;
        this.arenaRadius = (width / 2) - 5;
        this.inventory = 100;
        this.score = 0;
        this.balls = [];
        this.totalFiredRaw = 0;
        this.worldRotation = 0;
        this.autoFireTimer = 0;
        this.multiplier = 1;
        this.history = Array(20).fill(0);
        this.running = true;
    }
};