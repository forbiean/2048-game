// 数据存储管理
class GameStorage {
    constructor() {
        this.storageKeys = {
            bestScore: '2048-best-score',
            gamesPlayed: '2048-games-played',
            totalScore: '2048-total-score',
            winsCount: '2048-wins-count',
            theme: '2048-theme',
            gameState: '2048-game-state'
        };
    }

    // 获取最佳分数
    getBestScore() {
        return parseInt(localStorage.getItem(this.storageKeys.bestScore)) || 0;
    }

    // 设置最佳分数
    setBestScore(score) {
        localStorage.setItem(this.storageKeys.bestScore, score);
    }

    // 获取游戏次数
    getGamesPlayed() {
        return parseInt(localStorage.getItem(this.storageKeys.gamesPlayed)) || 0;
    }

    // 增加游戏次数
    incrementGamesPlayed() {
        const current = this.getGamesPlayed();
        localStorage.setItem(this.storageKeys.gamesPlayed, current + 1);
    }

    // 获取总分数
    getTotalScore() {
        return parseInt(localStorage.getItem(this.storageKeys.totalScore)) || 0;
    }

    // 增加总分数
    addToTotalScore(score) {
        const current = this.getTotalScore();
        localStorage.setItem(this.storageKeys.totalScore, current + score);
    }

    // 获取胜利次数
    getWinsCount() {
        return parseInt(localStorage.getItem(this.storageKeys.winsCount)) || 0;
    }

    // 增加胜利次数
    incrementWinsCount() {
        const current = this.getWinsCount();
        localStorage.setItem(this.storageKeys.winsCount, current + 1);
    }

    // 获取平均分数
    getAverageScore() {
        const totalScore = this.getTotalScore();
        const gamesPlayed = this.getGamesPlayed();
        return gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0;
    }

    // 获取主题设置
    getTheme() {
        return localStorage.getItem(this.storageKeys.theme) || 'light';
    }

    // 设置主题
    setTheme(theme) {
        localStorage.setItem(this.storageKeys.theme, theme);
    }

    // 保存游戏状态
    saveGameState(gameState) {
        try {
            const stateString = JSON.stringify(gameState);
            localStorage.setItem(this.storageKeys.gameState, stateString);
        } catch (error) {
            console.warn('无法保存游戏状态:', error);
        }
    }

    // 加载游戏状态
    loadGameState() {
        try {
            const stateString = localStorage.getItem(this.storageKeys.gameState);
            return stateString ? JSON.parse(stateString) : null;
        } catch (error) {
            console.warn('无法加载游戏状态:', error);
            return null;
        }
    }

    // 清除游戏状态
    clearGameState() {
        localStorage.removeItem(this.storageKeys.gameState);
    }

    // 获取所有统计数据
    getAllStats() {
        return {
            bestScore: this.getBestScore(),
            gamesPlayed: this.getGamesPlayed(),
            totalScore: this.getTotalScore(),
            winsCount: this.getWinsCount(),
            averageScore: this.getAverageScore(),
            theme: this.getTheme()
        };
    }

    // 重置所有统计数据
    resetAllStats() {
        Object.values(this.storageKeys).forEach(key => {
            if (key !== this.storageKeys.theme) { // 保留主题设置
                localStorage.removeItem(key);
            }
        });
    }

    // 检查是否是第一次游戏
    isFirstGame() {
        return this.getGamesPlayed() === 0;
    }

    // 更新分数统计（在游戏结束时调用）
    updateScoreStats(score) {
        this.addToTotalScore(score);
        const currentBest = this.getBestScore();
        if (score > currentBest) {
            this.setBestScore(score);
        }
    }

    // 检查是否达到2048
    checkWinCondition(tileValue) {
        if (tileValue >= 2048) {
            this.incrementWinsCount();
            return true;
        }
        return false;
    }
}

// 创建全局存储实例
window.gameStorage = new GameStorage();