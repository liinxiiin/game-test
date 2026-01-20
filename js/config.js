/**
 * 游戏全局配置与常量
 */
export const PHYSICS_PRESETS = {
    earth: {
        gravity: 0.13,
        initialSpeed: 8.5,
        edgeBounciness: 0.6,
        obstacleBounciness: 0.65,
        ballBounciness: 0.7,
        ballRadius: 4,
        cooldown: 15,
        rotationSpeed: 0.0025,
        autoFireLimit: 120
    },
    moon: {
        gravity: 0.026, // 0.13 * 0.2
        initialSpeed: 8.5,
        edgeBounciness: 0.75,
        obstacleBounciness: 0.65,
        ballBounciness: 0.7,
        ballRadius: 4,
        cooldown: 15,
        rotationSpeed: 0.0025,
        autoFireLimit: 120
    },
    comet: {
        gravity: 0.13,
        initialSpeed: 11.05, // 8.5 * 1.3
        edgeBounciness: 0.6,
        obstacleBounciness: 0.65,
        ballBounciness: 0.7,
        ballRadius: 4,
        cooldown: 8,
        rotationSpeed: 0.0045,
        autoFireLimit: 60
    }
};

export const COLORS = {
    earth: '#3b82f6',
    moon: '#94a3b8',
    comet: '#f59e0b',
    obstacle1: '#334155',
    obstacle2: '#1e293b',
    barrier: '#475569',
    barrierStroke: '#94a3b8',
    voidStroke: '#ef4444'
};

export const SETTINGS = {
    maxMultiplier: 64,
    statsSampleRate: 120, // 帧
    maxHistoryLength: 20,
    perturbationDeg: 5
};