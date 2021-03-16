const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(users => users.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found!" });
  };

  request.user = user;

  return next();

};

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((users) => users.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  };

  const newUser = {
    id: uuid(),
    name,
    username,
    todos: []
  }

  users.push(newUser);

  return response.json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);


});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todos = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todos);

  return response.status(201).json(user.todos[0])

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todos = user.todos.find(todos => todos.id === id);

  if (!todos) {
    return response.status(404).json({ error: "Not found" })
  }
  todos.title = title;;
  todos.deadline = new Date(deadline);

  return response.json(todos);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todos = user.todos.find(todos => todos.id === id);

  if (!todos) {
    return response.status(404).json({ error: "Not found" })
  }
  todos.done = true;


  return response.json(todos);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todos = user.todos.find(todos => todos.id === id);

  if (!todos) {
    return response.status(404).json({ error: "Not found" })
  }

  user.todos.splice(todos, 1);

  return response.status(204).json(user.todos);

});

module.exports = app;