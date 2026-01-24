
const todoForm = document.querySelector('form');
const todoInput = document.getElementById('todo-input');
const todoListUL = document.getElementById('todo-list');
// const deleteAllBtn = document.getElementsByClassName("DelTBn"); // new button
// console.log(deleteAllBtn);

let allTodos = getTodos();

updateTodoList();

// Create error box
const errorBox = document.createElement("div");
errorBox.className = "error-box";
document.body.appendChild(errorBox);

todoForm.addEventListener('submit', function(e){
    e.preventDefault();
    addTodo();
})

let DeleteAll = () => {
    allTodos = [];
    saveTodos();
    updateTodoList();
    showError("All Todos deleted", "success");
}
// deleteAllBtn.addEventListener("click", ()=>{
    
// })

function addTodo(){
    const todoText = todoInput.value.trim();
    if(todoText.length > 0){
        // check if edit mode
        if(todoInput.dataset.editIndex !== undefined){
            const editIndex = Number(todoInput.dataset.editIndex);
            allTodos[editIndex].text = todoText;
            delete todoInput.dataset.editIndex;
            showError("Todo updated", "success");
        } else {
            const todoObject = {
                text: todoText,
                completed: false
            }
            allTodos.push(todoObject);
        }
        updateTodoList();
        saveTodos();
        todoInput.value = "";
    } else {
        showError("Please enter a todo text", "error");
    }
}

function updateTodoList(){
    todoListUL.innerHTML = "";
    allTodos.forEach((todo, todoIndex)=>{
        const todoItem = createTodoItem(todo, todoIndex);
        todoListUL.append(todoItem);
    })
}

function createTodoItem(todo, todoIndex){
    const todoId = "todo-"+todoIndex;
    const todoLI = document.createElement("li");
    const todoText = todo.text;
    todoLI.className = "todo";
    todoLI.innerHTML = `
        <input type="checkbox" id="${todoId}">
        <label class="custom-checkbox" for="${todoId}">
            <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
        </label>
        <label for="${todoId}" class="todo-text">
            ${todoText}
        </label>

         <i class="fa-regular fa-pen-to-square edit-icon"></i>

        <button class="delete-button">
            <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
        </button>
    `
    // Delete single
    const deleteButton = todoLI.querySelector(".delete-button");
    deleteButton.addEventListener("click", ()=>{
        deleteTodoItem(todoIndex);
    })

    // Checkbox
    const checkbox = todoLI.querySelector("input");
    checkbox.addEventListener("change", ()=>{
        allTodos[todoIndex].completed = checkbox.checked;
        saveTodos();
    })
    checkbox.checked = todo.completed;

    // Edit functionality
    const editBtn = todoLI.querySelector(".edit-icon");
    editBtn.addEventListener("click", ()=>{
        todoInput.value = todo.text;
        todoInput.focus();
        todoInput.dataset.editIndex = todoIndex; // mark edit mode
    })

    return todoLI;
}

function deleteTodoItem(todoIndex){
    allTodos = allTodos.filter((_, i)=> i !== todoIndex);
    saveTodos();
    updateTodoList();
    showError("Todo deleted", "success");
}

function saveTodos(){
    const todosJson = JSON.stringify(allTodos);
    localStorage.setItem("todos", todosJson);
}

function getTodos(){
    const todos = localStorage.getItem("todos") || "[]";
    return JSON.parse(todos);
}

// Smooth error box function
function showError(message, type="error"){
    errorBox.textContent = message;
    errorBox.className = "error-box " + type;
    errorBox.style.opacity = "1";
    setTimeout(()=>{
        errorBox.style.opacity = "0";
    }, 2500);
}
