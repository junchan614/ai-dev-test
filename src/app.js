// To-Do アプリのメインJavaScriptファイル
// 段階1: バニラJavaScript版

class TodoApp {
    constructor() {
        this.tasks = [];
        this.filter = 'all'; // all, active, completed
        this.taskIdCounter = 1;
        
        this.initElements();
        this.bindEvents();
        this.loadTasks();
        this.render();
    }
    
    initElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        
        // フィルターボタン
        this.showAllBtn = document.getElementById('showAll');
        this.showActiveBtn = document.getElementById('showActive');
        this.showCompletedBtn = document.getElementById('showCompleted');
        
        // 統計表示
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
    }
    
    bindEvents() {
        // タスク追加
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // フィルターボタン
        this.showAllBtn.addEventListener('click', () => this.setFilter('all'));
        this.showActiveBtn.addEventListener('click', () => this.setFilter('active'));
        this.showCompletedBtn.addEventListener('click', () => this.setFilter('completed'));
    }
    
    addTask() {
        const taskText = this.taskInput.value.trim();
        
        if (!taskText) {
            alert('タスクを入力してください');
            return;
        }
        
        const task = {
            id: this.taskIdCounter++,
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this.taskInput.value = '';
        this.saveTasks();
        this.render();
        
        // 成功フィードバック
        this.showNotification('タスクを追加しました！');
    }
    
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
            
            const message = task.completed ? 'タスクを完了しました！' : 'タスクを未完了に戻しました';
            this.showNotification(message);
        }
    }
    
    deleteTask(id) {
        if (confirm('このタスクを削除しますか？')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
            this.showNotification('タスクを削除しました');
        }
    }
    
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            const newText = prompt('タスクを編集:', task.text);
            if (newText !== null && newText.trim() !== '') {
                task.text = newText.trim();
                this.saveTasks();
                this.render();
                this.showNotification('タスクを更新しました');
            }
        }
    }
    
    setFilter(filter) {
        this.filter = filter;
        
        // アクティブなフィルターボタンを更新
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        switch (filter) {
            case 'all':
                this.showAllBtn.classList.add('active');
                break;
            case 'active':
                this.showActiveBtn.classList.add('active');
                break;
            case 'completed':
                this.showCompletedBtn.classList.add('active');
                break;
        }
        
        this.render();
    }
    
    getFilteredTasks() {
        switch (this.filter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }
    
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // タスクリストをクリア
        this.taskList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            this.emptyState.style.display = 'block';
            this.taskList.style.display = 'none';
        } else {
            this.emptyState.style.display = 'none';
            this.taskList.style.display = 'block';
            
            filteredTasks.forEach(task => {
                const taskElement = this.createTaskElement(task);
                this.taskList.appendChild(taskElement);
            });
        }
        
        this.updateStats();
    }
    
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="todoApp.toggleTask(${task.id})">
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="btn-edit" onclick="todoApp.editTask(${task.id})">編集</button>
                    <button class="btn-delete" onclick="todoApp.deleteTask(${task.id})">削除</button>
                </div>
            </div>
        `;
        
        return li;
    }
    
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        this.totalTasks.textContent = `総タスク数: ${total}`;
        this.completedTasks.textContent = `完了: ${completed}`;
        this.pendingTasks.textContent = `未完了: ${pending}`;
    }
    
    saveTasks() {
        localStorage.setItem('todoApp_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('todoApp_counter', this.taskIdCounter.toString());
    }
    
    loadTasks() {
        const savedTasks = localStorage.getItem('todoApp_tasks');
        const savedCounter = localStorage.getItem('todoApp_counter');
        
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
        
        if (savedCounter) {
            this.taskIdCounter = parseInt(savedCounter);
        }
    }
    
    showNotification(message) {
        // 簡単な通知システム
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// アプリケーションの初期化
let todoApp;

document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});

// 通知アニメーション用CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);