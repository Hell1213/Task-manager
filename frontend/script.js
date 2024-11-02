const API_URL = "http://localhost:3000";

const todoList = document.getElementById("todoList");
const newTodoInput = document.getElementById("newTodo");

// it helps to make API request with authentication
async function apiCall(endPoint, method, data) {
  const token = localStorage.getItem("token");
  const headers = { "Content-type": "application/json" };
  if (token) headers["token"] = token;

  const user = await fetch(`${API_URL}${endPoint}`, {
    method,
    headers,
    body: data ? JSON.stringifydata : undefined,
  });
  return user.json();
}

//Add a new Todo
async function addTodo() {
  const todoTitle = document.getElementById("todo-title").value.trim();
  const todoDescription = document
    .getElementById("todo-description")
    .value.trim();

  if (todoTitle && todoDescription) {
    const user = await apiCall("/todo", "POST", {
      title: todoTitle,
      description: todoDescription,
    });

    if (user.todo) {
      displayTodo(user.todo);
      document.getElementById("todo-title").value = "";
      document.getElementById("todo-description").value = "";
    } else {
      alert("Failed to add todo");
    }
  }
}

// Delete a todo
async function deleteTodo(button, todoId) {
  const user = await apiCall(`/todo/${todoId}`, "DELETE");

  if (user.message === "Todo deleted") {
    const listItem = button.parentNode;
    listItem.remove();
  } else {
    alert("failed to delete todo");
  }
}

// Function to mark a todo as done
async function markDone(button, todoId) {
  const user = await apiCall(`/todo/${todoId}/done`, "PUT");

  if (user.message === "Todo marked as done") {
    const listItem = button.parentNode;
    const todoText = listItem.querySelector("span");
    todoText.classList.add("done");
    button.style.display = "none";
  } else {
    alert("Failed to mark todo as done");
  }
}

// Function to display a todo item in the list
function displayTodo(todo) {
  const newTodo = document.createElement("li");
  newTodo.innerHTML = `
      <span>${todo.title}</span>
      <button class="done-btn" onclick="markDone(this, '${todo._id}')">Done</button>
      <button class="delete" onclick="deleteTodo(this, '${todo._id}')">Delete</button>
    `;
  if (todo.done) {
    newTodo.querySelector("span").classList.add("done");
    newTodo.querySelector(".done-btn").style.display = "none";
  }
  todoList.appendChild(newTodo);
}

// Fetch and display all todos for the authenticated user
async function fetchTodos() {
  console.log("fetching todos...");
  const user = await apiCall("/todos", "GET");
  console.log(user);

  if (user.todos) {
    todoList.innerHTML = ""; // Clear current list
    user.todos.forEach(displayTodo);
  } else {
    alert("Failed to fetch todos");
  }
}
