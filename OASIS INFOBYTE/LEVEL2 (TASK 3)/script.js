
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const pendingList = document.getElementById('pending-list');
    const completedList = document.getElementById('completed-list');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const confettiContainer = document.querySelector('.confetti-container');
    const container = document.querySelector('.container');

    // Load tasks from localStorage
    loadTasks();

    // Add Task
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });

    // Theme Switching
    themeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            document.body.className = `${theme}-theme`;
            
            // Bounce animation
            this.style.animation = 'bounce 0.5s';
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
            
            saveTheme(theme);
        });
    });

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;

        const taskId = Date.now();
        const timestamp = new Date().toLocaleString();
        
        createTaskElement(taskText, taskId, timestamp, false);
        saveTask(taskText, taskId, timestamp, false);
        
        // Clear input
        taskInput.value = '';
        
        // Create confetti effect
        createConfetti();
        
        // Bounce animation for the container
        container.style.animation = 'bounce 0.5s';
        setTimeout(() => {
            container.style.animation = '';
        }, 500);
    }

    function createTaskElement(text, id, timestamp, isCompleted) {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${isCompleted ? 'completed' : ''}`;
        taskItem.setAttribute('data-id', id);
        
        taskItem.innerHTML = `
            <span class="task-text">${text}</span>
            <div class="task-actions">
                <button class="task-btn complete-btn">${isCompleted ? '↩' : '✓'}</button>
                <button class="task-btn edit-btn">✏️</button>
                <button class="task-btn delete-btn">🗑️</button>
            </div>
            <div class="task-timestamp">${timestamp}</div>
        `;
        
        if (isCompleted) {
            completedList.appendChild(taskItem);
        } else {
            pendingList.appendChild(taskItem);
        }
        
        // Add event listeners
        const completeBtn = taskItem.querySelector('.complete-btn');
        const editBtn = taskItem.querySelector('.edit-btn');
        const deleteBtn = taskItem.querySelector('.delete-btn');
        
        completeBtn.addEventListener('click', toggleComplete);
        editBtn.addEventListener('click', editTask);
        deleteBtn.addEventListener('click', deleteTask);
    }

    function toggleComplete(e) {
        const taskItem = e.target.closest('.task-item');
        const taskId = taskItem.getAttribute('data-id');
        const isCompleted = taskItem.classList.contains('completed');
        
        if (isCompleted) {
            // Move to pending
            taskItem.classList.remove('completed');
            taskItem.querySelector('.complete-btn').textContent = '✓';
            pendingList.appendChild(taskItem);
            updateTaskStatus(taskId, false);
        } else {
            // Move to completed
            taskItem.classList.add('completed');
            taskItem.querySelector('.complete-btn').textContent = '↩';
            completedList.appendChild(taskItem);
            updateTaskStatus(taskId, true);
            
            // Add completion timestamp
            const timestampEl = taskItem.querySelector('.task-timestamp');
            timestampEl.textContent += ` | Completed: ${new Date().toLocaleString()}`;
        }
        
        // Float animation
        taskItem.style.transform = 'translateY(-20px)';
        taskItem.style.opacity = '0';
        setTimeout(() => {
            taskItem.style.transform = '';
            taskItem.style.opacity = '';
        }, 300);
    }

    function editTask(e) {
        const taskItem = e.target.closest('.task-item');
        const taskText = taskItem.querySelector('.task-text');
        const currentText = taskText.textContent;
        const taskId = taskItem.getAttribute('data-id');
        
        const newText = prompt('Edit your task:', currentText);
        if (newText !== null && newText.trim() !== '') {
            taskText.textContent = newText.trim();
            updateTaskText(taskId, newText.trim());
        }
    }

    function deleteTask(e) {
        const taskItem = e.target.closest('.task-item');
        const taskId = taskItem.getAttribute('data-id');
        
        // Fade out animation
        taskItem.style.animation = 'fadeIn 0.3s reverse';
        setTimeout(() => {
            taskItem.remove();
            removeTask(taskId);
        }, 300);
    }

    function createConfetti() {
        // Clear previous confetti
        confettiContainer.innerHTML = '';
        
        // Create new confetti
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDuration = `${Math.random() * 2 + 1}s`;
            confetti.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary');
            confettiContainer.appendChild(confetti);
        }
        
        // Remove confetti after animation
        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, 3000);
    }

    // LocalStorage Functions
    function saveTask(text, id, timestamp, isCompleted) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push({ text, id, timestamp, isCompleted });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const theme = localStorage.getItem('theme') || 'pastel';
        
        // Set theme
        document.body.className = `${theme}-theme`;
        
        // Load tasks
        tasks.forEach(task => {
            createTaskElement(task.text, task.id, task.timestamp, task.isCompleted);
        });
    }

    function updateTaskStatus(id, isCompleted) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const taskIndex = tasks.findIndex(task => task.id == id);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].isCompleted = isCompleted;
            if (isCompleted) {
                tasks[taskIndex].completedTimestamp = new Date().toLocaleString();
            }
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }

    function updateTaskText(id, newText) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const taskIndex = tasks.findIndex(task => task.id == id);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].text =newText;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }

    function removeTask(id) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => task.id != id);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }
});
