// 主题管理
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themeToggle = document.getElementById('theme-toggle');
        this.init();
    }

    init() {
        // 从存储加载主题设置
        this.currentTheme = window.gameStorage.getTheme();
        this.applyTheme();
        
        // 监听系统主题变化
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener((e) => {
                if (this.currentTheme === 'auto') {
                    this.applyAutoTheme();
                }
            });
        }
        
        // 绑定切换按钮事件
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    // 应用主题
    applyTheme() {
        const body = document.body;
        
        if (this.currentTheme === 'dark') {
            body.classList.add('dark-mode');
            this.updateToggleButton('🌙');
        } else if (this.currentTheme === 'light') {
            body.classList.remove('dark-mode');
            this.updateToggleButton('☀️');
        } else if (this.currentTheme === 'auto') {
            this.applyAutoTheme();
        }
        
        // 保存主题设置
        window.gameStorage.setTheme(this.currentTheme);
    }

    // 应用自动主题（根据系统偏好）
    applyAutoTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            this.updateToggleButton('🌙');
        } else {
            document.body.classList.remove('dark-mode');
            this.updateToggleButton('☀️');
        }
    }

    // 切换主题
    toggleTheme() {
        // 添加切换动画
        if (this.themeToggle) {
            this.themeToggle.classList.add('switching');
            setTimeout(() => {
                this.themeToggle.classList.remove('switching');
            }, 500);
        }
        
        // 循环切换主题
        const themes = ['light', 'dark'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.currentTheme = themes[nextIndex];
        
        this.applyTheme();
    }

    // 更新切换按钮图标
    updateToggleButton(icon) {
        if (this.themeToggle) {
            this.themeToggle.textContent = icon;
        }
    }

    // 获取当前主题
    getCurrentTheme() {
        return this.currentTheme;
    }

    // 设置特定主题
    setTheme(theme) {
        if (['light', 'dark', 'auto'].includes(theme)) {
            this.currentTheme = theme;
            this.applyTheme();
        }
    }

    // 检查是否为深色模式
    isDarkMode() {
        if (this.currentTheme === 'dark') {
            return true;
        } else if (this.currentTheme === 'auto') {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    }
}

// 创建全局主题管理器实例
window.themeManager = new ThemeManager();