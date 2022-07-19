const express = require('express');
const { v4: uuidv4} = require('uuid');
const cors = require('cors');
const {getDateDia } = require('./functions');
const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
   const { username } = request.headers;

  const user = users.find((user) => user.username === username);
    
    if (!user) {
      return response.status(400).json({error: "user does not exists!"});
    }

    request.users = user;

    return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({error: "User already exists!"});
  }

  users.push({
    id: uuidv4(),
    username,
    name,
    todos: []
  })
  
  return response.status(201).json([{message: "sign in sucessfully!"}, users.at(-1)])

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { users } = request;

  return response.status(200).json(users.todos);   
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { users } = request;
  const { title, deadline } = request.body;
  const Dia = getDateDia();

  users.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline,
    create_at: Dia[0] + '-' + Dia[1]
  })

  return response.status(201).json([{message: `todo assigned to user ${users.username}:`}, users.todos])
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { users } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = users.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({error: `todo id does not exists for ${users.username}` })  
  }

  todo.title   = title;
  todo.deadline = deadline;

  return response.status(201).json([{message: `todo ${id} updated!`}, todo])
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { users } = request;
  const { id } = request.params;
  const { username } = request.headers;

  const todo = users.todos.find((todo) => todo.id === id);
  
  if (!todo) {
    return response.status(404).json({ error: `todo ID doesn't found for ${username}` })
  }

  if (!todo.done === false){
    return response.status(401).json([{ error: 'this todo is already done' }, todo])
  }else{
    todo.done = true;
    return response.status(201).json([{ message: 'todo was done!' }, todo]);
  }

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { users } = request;
  const { id } = request.params;

  const todo = users.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(400).json({ error: `todo does not exists for ${users.username}`});  
  }

  users.todos.splice(todo, 1);
  return response.status(204).json();

});

module.exports = app;