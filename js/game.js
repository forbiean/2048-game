// 2048游戏核心逻辑
class Game2048 {
    constructor() {
        this.size = 4;
        this.board = [];
        this.score = 0;
        this.bestScore = window.gameStorage.getBestScore();
        this.gameWon = false;
        this.gameOver = false;
        this.moveHistory = []; // 用于撤销功能
        this.maxUndoSteps = 10; // 最大撤销步数
        
        this.init();
    }

    // 初始化游戏
    init() {
        this.board = this.createEmptyBoard();
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.moveHistory = [];
        this.addRandomTile();
        this.addRandomTile();
    }

    // 创建空的游戏板
    createEmptyBoard() {
        return Array(this.size).fill().map(() => Array(this.size).fill(0));
    }

    // 添加随机方块
    addRandomTile() {
        const emptyCells = this.getEmptyCells();
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.board[randomCell.row][randomCell.col] = value;
            return { row: randomCell.row, col: randomCell.col, value };
        }
        return null;
    }

    // 获取空位置
    getEmptyCells() {
        const emptyCells = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        return emptyCells;
    }

    // 保存当前状态到历史记录
    saveState() {
        const state = {
            board: this.board.map(row => [...row]), // 深拷贝
            score: this.score,
            gameWon: this.gameWon,
            gameOver: this.gameOver
        };
        
        this.moveHistory.push(state);
        
        // 限制历史记录长度
        if (this.moveHistory.length > this.maxUndoSteps) {
            this.moveHistory.shift();
        }
    }

    // 撤销操作
    undo() {
        if (this.moveHistory.length > 0) {
            const previousState = this.moveHistory.pop();
            this.board = previousState.board;
            this.score = previousState.score;
            this.gameWon = previousState.gameWon;
            this.gameOver = previousState.gameOver;
            return true;
        }
        return false;
    }

    // 检查是否可以撤销
    canUndo() {
        return this.moveHistory.length > 0;
    }

    // 移动逻辑
    move(direction) {
        if (this.gameOver) {
            return { moved: false, score: 0 };
        }

        // 保存当前状态
        this.saveState();

        let moved = false;
        let scoreIncrease = 0;
        const newBoard = this.createEmptyBoard();

        const moveAndMerge = (line) => {
            // 移除0
            let filtered = line.filter(val => val !== 0);
            
            // 合并相同的数字
            for (let i = 0; i < filtered.length - 1; i++) {
                if (filtered[i] === filtered[i + 1]) {
                    filtered[i] *= 2;
                    scoreIncrease += filtered[i];
                    filtered.splice(i + 1, 1);
                    
                    // 检查是否获胜
                    if (filtered[i] === 2048 && !this.gameWon) {
                        this.gameWon = true;
                        window.gameStorage.incrementWinsCount();
                    }
                }
            }
            
            // 补0
            while (filtered.length < this.size) {
                filtered.push(0);
            }
            
            return filtered;
        };

        // 根据方向处理移动
        if (direction === 'left') {
            for (let row = 0; row < this.size; row++) {
                const originalRow = [...this.board[row]];
                const newRow = moveAndMerge(originalRow);
                newBoard[row] = newRow;
                // 检查是否有变化
                for (let i = 0; i < this.size; i++) {
                    if (newRow[i] !== originalRow[i]) {
                        moved = true;
                        break;
                    }
                }
            }
        } else if (direction === 'right') {
            for (let row = 0; row < this.size; row++) {
                const originalRow = [...this.board[row]];
                const newRow = moveAndMerge(originalRow.reverse()).reverse();
                newBoard[row] = newRow;
                // 检查是否有变化
                for (let i = 0; i < this.size; i++) {
                    if (newRow[i] !== originalRow[i]) {
                        moved = true;
                        break;
                    }
                }
            }
        } else if (direction === 'up') {
            for (let col = 0; col < this.size; col++) {
                const column = [];
                for (let row = 0; row < this.size; row++) {
                    column.push(this.board[row][col]);
                }
                const originalColumn = [...column];
                const newColumn = moveAndMerge(column);
                for (let row = 0; row < this.size; row++) {
                    newBoard[row][col] = newColumn[row];
                    if (newColumn[row] !== originalColumn[row]) {
                        moved = true;
                    }
                }
            }
        } else if (direction === 'down') {
            for (let col = 0; col < this.size; col++) {
                const column = [];
                for (let row = 0; row < this.size; row++) {
                    column.push(this.board[row][col]);
                }
                const originalColumn = [...column];
                const newColumn = moveAndMerge(column.reverse()).reverse();
                for (let row = 0; row < this.size; row++) {
                    newBoard[row][col] = newColumn[row];
                    if (newColumn[row] !== originalColumn[row]) {
                        moved = true;
                    }
                }
            }
        }

        let newTile = null;
        if (moved) {
            this.board = newBoard;
            this.score += scoreIncrease;
            
            // 添加新方块
            newTile = this.addRandomTile();
            
            // 检查游戏是否结束
            this.checkGameOver();
            
            // 更新最佳分数
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                window.gameStorage.setBestScore(this.bestScore);
            }
            
            // 更新分数统计
            if (scoreIncrease > 0) {
                window.gameStorage.updateScoreStats(scoreIncrease);
            }
        } else {
            // 如果没有移动，移除保存的状态
            this.moveHistory.pop();
        }

        return { moved, score: scoreIncrease, newTile: newTile };
    }

    // 检查游戏是否结束
    checkGameOver() {
        // 检查是否还有空格
        if (this.getEmptyCells().length > 0) {
            return false;
        }

        // 检查是否还能合并
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const current = this.board[row][col];
                // 检查右边
                if (col < this.size - 1 && this.board[row][col + 1] === current) {
                    return false;
                }
                // 检查下边
                if (row < this.size - 1 && this.board[row + 1][col] === current) {
                    return false;
                }
            }
        }

        this.gameOver = true;
        
        // 更新游戏统计
        window.gameStorage.incrementGamesPlayed();
        window.gameStorage.updateScoreStats(this.score);
        
        return true;
    }

    // 获取游戏状态
    getGameState() {
        return {
            board: this.board,
            score: this.score,
            bestScore: this.bestScore,
            gameWon: this.gameWon,
            gameOver: this.gameOver
        };
    }

    // 从状态恢复游戏
    restoreGameState(state) {
        this.board = state.board.map(row => [...row]);
        this.score = state.score;
        this.bestScore = state.bestScore;
        this.gameWon = state.gameWon;
        this.gameOver = state.gameOver;
    }

    // 开始新游戏
    newGame() {
        this.init();
        this.moveHistory = []; // 清空历史记录
    }

    // 获取方块值（用于显示）
    getTileValue(row, col) {
        return this.board[row][col];
    }

    // 获取所有方块位置
    getAllTiles() {
        const tiles = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] !== 0) {
                    tiles.push({
                        row,
                        col,
                        value: this.board[row][col]
                    });
                }
            }
        }
        return tiles;
    }
}

// 创建全局游戏实例
window.game = new Game2048();