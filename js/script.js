// Select DOM elements
const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const dateInput = document.getElementById('date-input');
const todoList = document.getElementById('todo-list');
const errorMessage = document.getElementById('error-message');
const filterBtns = document.querySelectorAll('.filter-btn');

// Array to store todos
let todos = [];
let currentFilter = 'all';

// Initialize app
init();

function init() {
    // Load todos from localStorage if available
    loadTodos();
    
    // Event listeners
    todoForm.addEventListener('submit', handleAddTodo);
    filterBtns.forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });
    
    // Render todos
    renderTodos();
}

// Handle form submission
function handleAddTodo(e) {
    e.preventDefault();
    
    // Get input values
    const task = taskInput.value.trim();
    const date = dateInput.value;
    
    // Validate inputs
    if (!validateInputs(task, date)) {
        return;
    }
    
    // Clear error message
    hideError();
    
    // Create todo object
    const todo = {
        id: Date.now(),
        task: task,
        date: date,
        completed: false
    };
    
    // Add to todos array
    todos.push(todo);
    
    // Save to localStorage
    saveTodos();
    
    // Render todos
    renderTodos();
    
    // Clear form
    taskInput.value = '';
    dateInput.value = '';
    taskInput.focus();
}

// Validate form inputs
function validateInputs(task, date) {
    if (!task) {
        showError('Please enter a task!');
        return false;
    }
    
    if (!date) {
        showError('Please select a due date!');
        return false;
    }
    
    return true;
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

// Hide error message
function hideError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
}

// Render todos to the DOM
function renderTodos() {
    // Clear current list
    todoList.innerHTML = '';
    
    // Filter todos based on current filter
    const filteredTodos = filterTodos();
    
    // Check if list is empty
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No tasks to display</div>';
        return;
    }
    
    // Create todo items
    filteredTodos.forEach(todo => {
        const todoItem = createTodoElement(todo);
        todoList.appendChild(todoItem);
    });
}

// Create todo element
function createTodoElement(todo) {
    const todoItem = document.createElement('div');
    todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    todoItem.dataset.id = todo.id;
    
    // Format date for display
    const formattedDate = formatDate(todo.date);
    
    todoItem.innerHTML = `
        <div class="todo-left">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleComplete(${todo.id})"
            >
            <div class="todo-content">
                <div class="todo-task">${escapeHtml(todo.task)}</div>
                <div class="todo-date">Due: ${formattedDate}</div>
            </div>
        </div>
        <div class="todo-actions">
            <button class="btn-delete" onclick="deleteTodo(${todo.id})">Delete</button>
        </div>
    `;
    
    return todoItem;
}

// Format date to readable string
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Toggle todo completion
function toggleComplete(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

// Delete todo
function deleteTodo(id) {
    // Optional: Add confirmation
    if (confirm('Are you sure you want to delete this task?')) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        renderTodos();
    }
}

// Handle filter button clicks
function handleFilter(e) {
    // Update active button
    filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    // Set current filter
    currentFilter = e.target.dataset.filter;
    
    // Re-render todos
    renderTodos();
}

// Filter todos based on current filter
function filterTodos() {
    switch(currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        case 'all':
        default:
            return todos;
    }
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Load todos from localStorage
function loadTodos() {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
        todos = JSON.parse(storedTodos);
    }
}