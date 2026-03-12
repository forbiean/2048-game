// 用户界面管理
class UIManager {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.tileContainer = document.getElementById('tile-container');
        this.currentScoreEl = document.getElementById('current-score');
        this.bestScoreEl = document.getElementById('best-score');
        this.gamesPlayedEl = document.getElementById('games-played');
        this.avgScoreEl = document.getElementById('avg-score');
        this.winsCountEl = document.getElementById('wins-count');
        this.undoBtn = document.getElementById('undo-btn');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        this.restartBtn = document.getElementById('restart-btn');
        this.continueBtn = document.getElementById('continue-btn');
        
        this.tileElements = {};
        this.initialized = false;
        this.init();
    }

    init() {
        this.createGridCells();
        // 延迟绑定事件，确保游戏对象已初始化
        setTimeout(() => {
            this.bindEvents();
            this.updateStats();
            this.updateScores();
            this.initialized = true;
        }, 100);
    }

    // 创建背景网格
    createGridCells() {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.style.gridRow = row + 1;
                cell.style.gridColumn = col + 1;
                this.gameBoard.appendChild(cell);
            }
        }
    }

    // 绑定事件
    bindEvents() {
        if (this.undoBtn) {
            this.undoBtn.addEventListener('click', () => {
                this.handleUndo();
            });
        }

        if (this.newGameBtn) {
            this.newGameBtn.addEventListener('click', () => {
                this.handleNewGame();
            });
        }

        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => {
                this.hideGameOverModal();
                this.handleNewGame();
            });
        }

        if (this.continueBtn) {
            this.continueBtn.addEventListener('click', () => {
                this.hideGameOverModal();
            });
        }

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // 确保页面可以获得焦点
        document.body.setAttribute('tabindex', '0');
        document.body.focus();

        // 触摸事件
        this.setupTouchControls();
    }

    // 设置触摸控制
    setupTouchControls() {
        let startX, startY, startTime;
        const minSwipeDistance = 30;
        const maxSwipeTime = 300;

        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startTime = Date.now();
        };

        const handleTouchEnd = (e) => {
            if (!startX || !startY || !startTime) return;

            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            const endTime = Date.now();

            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;

            if (deltaTime > maxSwipeTime) return;

            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            if (absX < minSwipeDistance && absY < minSwipeDistance) return;

            let direction;
            if (absX > absY) {
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                direction = deltaY > 0 ? 'down' : 'up';
            }

            this.handleMove(direction);
        };

        // 绑定触摸事件
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    // 处理键盘按键
    handleKeyPress(e) {
        if (!window.game || window.game.gameOver) {
            return;
        }

        let direction = null;
        
        // 使用keyCode作为备选方案
        switch(e.code) {
            case 'ArrowUp':
            case 'KeyW':
                direction = 'up';
                break;
            case 'ArrowDown':
            case 'KeyS':
                direction = 'down';
                break;
            case 'ArrowLeft':
            case 'KeyA':
                direction = 'left';
                break;
            case 'ArrowRight':
            case 'KeyD':
                direction = 'right';
                break;
        }

        if (direction) {
            e.preventDefault();
            this.handleMove(direction);
        }
    }

    // 处理移动
    handleMove(direction) {
        if (!window.game || window.game.gameOver) {
            return;
        }

        const result = window.game.move(direction);
        
        if (result.moved) {
            this.updateBoard();
            this.updateScores();
            this.updateUndoButton();
            
            // 显示分数增加动画
            if (result.score > 0) {
                this.showScorePopup(result.score);
            }
            
            // 显示新方块动画
            if (result.newTile) {
                this.animateNewTile(result.newTile);
            }
            
            // 检查游戏状态
            if (window.game.gameWon && !window.game.gameOver) {
                this.showWinModal();
            } else if (window.game.gameOver) {
                this.showGameOverModal();
            }
        }
    }

    // 处理撤销
    handleUndo() {
        if (!window.game) return;
        if (window.game.canUndo()) {
            window.game.undo();
            this.updateBoard();
            this.updateScores();
            this.updateUndoButton();
        }
    }

    // 处理新游戏
    handleNewGame() {
        if (!window.game) return;
        window.game.newGame();
        this.updateBoard(true); // 标记为新游戏
        this.updateScores();
        this.updateUndoButton();
        this.updateStats();
    }

    // 更新游戏板
    updateBoard(isNewGame = false) {
        // 获取当前所有方块
        const tiles = window.game.getAllTiles();
        
        // 创建现有方块的映射
        const existingTiles = {};
        Object.keys(this.tileElements).forEach(id => {
            existingTiles[id] = this.tileElements[id];
        });
        
        // 清空映射，准备重新填充
        this.tileElements = {};
        
        // 处理每个方块
        tiles.forEach((tile, index) => {
            const tileId = `tile-${tile.row}-${tile.col}`;
            let tileEl = existingTiles[tileId];
            
            if (tileEl) {
                // 方块已存在，更新位置和值
                this.updateTileElement(tileEl, tile);
            } else {
                // 创建新方块，新游戏时添加延迟避免同时闪烁
                if (isNewGame) {
                    // 新游戏时延迟创建，避免所有方块同时动画
                    setTimeout(() => {
                        this.createTileElement(tile, true);
                    }, index * 100);
                } else {
                    // 普通移动时立即创建
                    this.createTileElement(tile, false);
                }
            }
            
            // 从现有方块中移除已处理的方块
            delete existingTiles[tileId];
        });
        
        // 移除不再存在的方块
        Object.values(existingTiles).forEach(tileEl => {
            tileEl.remove();
        });
    }

    // 创建方块元素
    createTileElement(tile, isNewGame = false) {
        const tileEl = document.createElement('div');
        const tileId = `tile-${tile.row}-${tile.col}`;
        
        tileEl.className = `tile tile-${tile.value}`;
        tileEl.id = tileId;
        tileEl.textContent = tile.value;
        // CSS Grid使用1-based索引，直接设置位置
        tileEl.style.gridRow = tile.row + 1;
        tileEl.style.gridColumn = tile.col + 1;
        
        this.tileContainer.appendChild(tileEl);
        this.tileElements[tileId] = tileEl;
        
        // 延迟添加动画类，避免闪烁
        if (isNewGame) {
            // 新游戏时延迟添加动画，让元素先稳定显示
            setTimeout(() => {
                tileEl.classList.add('tile-new');
                // 动画完成后移除动画类
                setTimeout(() => {
                    tileEl.classList.remove('tile-new');
                }, 300);
            }, 50);
        } else {
            // 普通移动时立即添加动画类
            tileEl.classList.add('tile-new');
            // 动画完成后移除动画类
            setTimeout(() => {
                tileEl.classList.remove('tile-new');
            }, 300);
        }
    }

    // 更新现有方块元素
    updateTileElement(tileEl, tile) {
        const oldValue = parseInt(tileEl.textContent);
        const newValue = tile.value;
        const oldRow = parseInt(tileEl.style.gridRow) - 1;
        const oldCol = parseInt(tileEl.style.gridColumn) - 1;
        
        // 检查是否有位置变化
        const positionChanged = oldRow !== tile.row || oldCol !== tile.col;
        const valueChanged = oldValue !== newValue;
        
        // 更新位置
        if (positionChanged) {
            tileEl.style.gridRow = tile.row + 1;
            tileEl.style.gridColumn = tile.col + 1;
        }
        
        // 如果值发生变化，更新类和文本
        if (valueChanged) {
            tileEl.className = `tile tile-${newValue}`;
            tileEl.textContent = newValue;
            
            // 如果是合并（值翻倍），添加合并动画
            if (newValue > oldValue) {
                tileEl.classList.add('tile-merged');
                setTimeout(() => {
                    tileEl.classList.remove('tile-merged');
                }, 120);
            }
        }
        
        // 只有在位置变化且不是合并时添加移动动画
        if (positionChanged && !valueChanged) {
            tileEl.classList.add('tile-moving');
            setTimeout(() => {
                tileEl.classList.remove('tile-moving');
            }, 100);
        }
        
        // 重新添加到映射中
        this.tileElements[tileEl.id] = tileEl;
    }

    // 更新分数显示
    updateScores() {
        if (this.currentScoreEl) {
            this.animateNumberChange(this.currentScoreEl, window.game.score);
        }
        
        if (this.bestScoreEl) {
            this.bestScoreEl.textContent = window.game.bestScore;
        }
    }

    // 更新统计信息
    updateStats() {
        const stats = window.gameStorage.getAllStats();
        
        if (this.gamesPlayedEl) {
            this.animateNumberChange(this.gamesPlayedEl, stats.gamesPlayed);
        }
        
        if (this.avgScoreEl) {
            this.animateNumberChange(this.avgScoreEl, stats.averageScore);
        }
        
        if (this.winsCountEl) {
            this.animateNumberChange(this.winsCountEl, stats.winsCount);
        }
    }

    // 更新撤销按钮状态
    updateUndoButton() {
        if (this.undoBtn) {
            this.undoBtn.disabled = !window.game.canUndo();
        }
    }

    // 数字变化动画
    animateNumberChange(element, newValue) {
        const oldValue = parseInt(element.textContent) || 0;
        const diff = newValue - oldValue;
        
        if (diff === 0) {
            element.textContent = newValue;
            return;
        }

        const duration = 300;
        const startTime = Date.now();
        const step = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(oldValue + diff * progress);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        requestAnimationFrame(step);
        element.classList.add('updated');
        setTimeout(() => element.classList.remove('updated'), 400);
    }

    // 显示分数弹出动画
    showScorePopup(score) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${score}`;
        
        // 随机位置显示
        const randomX = Math.random() * 200 + 50;
        const randomY = Math.random() * 100 + 50;
        popup.style.left = randomX + 'px';
        popup.style.top = randomY + 'px';
        
        this.tileContainer.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }

    // 新方块出现动画
    animateNewTile(tile) {
        const tileId = `tile-${tile.row}-${tile.col}`;
        const tileEl = this.tileElements[tileId];
        
        if (tileEl) {
            tileEl.classList.add('tile-new');
        }
    }

    // 显示游戏结束弹窗
    showGameOverModal() {
        if (!this.gameOverModal) return;
        
        this.modalTitle.textContent = '游戏结束!';
        this.modalMessage.textContent = `最终分数: ${window.game.score}`;
        this.continueBtn.style.display = 'none';
        
        this.gameOverModal.style.display = 'flex';
        setTimeout(() => {
            this.gameOverModal.classList.add('show');
        }, 10);
        
        // 更新统计
        this.updateStats();
    }

    // 显示获胜弹窗
    showWinModal() {
        if (!this.gameOverModal) return;
        
        this.modalTitle.textContent = '恭喜你!';
        this.modalMessage.textContent = '你达到了2048!';
        this.continueBtn.style.display = 'inline-block';
        
        this.gameOverModal.style.display = 'flex';
        setTimeout(() => {
            this.gameOverModal.classList.add('show');
        }, 10);
    }

    // 隐藏游戏结束弹窗
    hideGameOverModal() {
        if (!this.gameOverModal) return;
        
        this.gameOverModal.classList.remove('show');
        setTimeout(() => {
            this.gameOverModal.style.display = 'none';
        }, 300);
    }
}

// 创建全局UI管理器实例
window.uiManager = new UIManager();