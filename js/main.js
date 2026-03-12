// 主程序入口
class Main {
    constructor() {
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.startGame();
            });
        } else {
            this.startGame();
        }
    }

    startGame() {
        // 初始化游戏
        this.setupGame();
        
        // 检查是否有保存的游戏状态
        this.checkSavedGame();
        
        // 绑定窗口事件
        this.bindWindowEvents();
        
        console.log('2048游戏已启动!');
    }

    setupGame() {
        // 确保所有管理器都已初始化
        if (window.game && window.uiManager) {
            // 更新UI
            window.uiManager.updateBoard();
            window.uiManager.updateScores();
            window.uiManager.updateStats();
            window.uiManager.updateUndoButton();
            
            // 确保UI管理器完成初始化
            if (window.uiManager.initialized) {
                console.log('游戏初始化完成');
            }
        } else {
            console.warn('游戏或UI管理器未准备好，重试...');
            setTimeout(() => this.setupGame(), 100);
        }
    }

    checkSavedGame() {
        const savedState = window.gameStorage.loadGameState();
        if (savedState && savedState.board) {
            // 恢复游戏状态
            window.game.restoreGameState(savedState);
            window.uiManager.updateBoard();
            window.uiManager.updateScores();
            window.uiManager.updateUndoButton();
            console.log('已恢复保存的游戏进度');
        }
    }

    bindWindowEvents() {
        // 页面可见性变化时保存游戏状态
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 页面隐藏时保存游戏状态
                this.saveGameState();
            }
        });

        // 页面卸载时保存游戏状态
        window.addEventListener('beforeunload', () => {
            this.saveGameState();
        });

        // 窗口大小变化时重新调整布局
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // 处理页面失去焦点的情况
        window.addEventListener('blur', () => {
            this.saveGameState();
        });
    }

    saveGameState() {
        if (window.game && !window.game.gameOver) {
            const gameState = window.game.getGameState();
            window.gameStorage.saveGameState(gameState);
        }
    }

    handleResize() {
        // 重新计算布局（如果需要的话）
        // 这里可以添加响应式布局调整逻辑
        if (window.uiManager) {
            // 可以在这里添加重新计算方块位置的逻辑
        }
    }

    // 公共方法：重置游戏
    resetGame() {
        window.game.newGame();
        window.gameStorage.clearGameState();
        window.uiManager.updateBoard();
        window.uiManager.updateScores();
        window.uiManager.updateUndoButton();
    }

    // 公共方法：获取游戏统计
    getGameStats() {
        return window.gameStorage.getAllStats();
    }

    // 公共方法：重置所有统计
    resetStats() {
        window.gameStorage.resetAllStats();
        window.uiManager.updateStats();
        window.uiManager.updateScores();
    }
}

// 启动游戏
window.addEventListener('load', () => {
    window.gameMain = new Main();
});

// 暴露全局方法供调试使用
window.resetGame = () => {
    if (window.gameMain) {
        window.gameMain.resetGame();
    }
};

window.getGameStats = () => {
    if (window.gameMain) {
        return window.gameMain.getGameStats();
    }
    return null;
};

window.resetStats = () => {
    if (window.gameMain) {
        window.gameMain.resetStats();
    }
};