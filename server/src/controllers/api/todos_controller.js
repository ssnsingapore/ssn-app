import express from 'express';
import passport from 'passport';

import { Todo } from 'models/Todo';
import { asyncWrap } from 'util/async_wrapper';

export const todosRouter = express.Router();

// See here https://github.com/jaredhanson/passport/issues/458 for failWithError option that allows propagation to error-handling middleware
todosRouter.use('/todos', passport.authenticate('jwt', { session: false, failWithError: true }));

todosRouter.get('/todos', asyncWrap(getTodos));
async function getTodos(_req, res) {
  const todos = await Todo.find({});

  return res
    .status(200)
    .json({ todos: todos.map(todo => todo.toJSON()) });
}

todosRouter.post('/todos', asyncWrap(addTodo));
async function addTodo(req, res) {
  const {
    description, isDone, addedAt,
  } = req.body.todo;

  const todo = new Todo({
    description,
    isDone,
    addedAt,
  });

  await todo.save();
  return res
    .status(201)
    .json({ todo: todo.toJSON() });
}

todosRouter.put('/todos/:id', asyncWrap(updateTodo));
async function updateTodo(req, res) {
  const todoId = req.params.id;
  const {
    description, isDone, addedAt,
  } = req.body.todo;

  const todo = await Todo.findByIdAndUpdate(todoId, {
    description,
    isDone,
    addedAt,
  });

  return res
    .status(200)
    .json({ todo: todo.toJSON() });
}

todosRouter.delete('/todos/:id', asyncWrap(deleteTodo));
async function deleteTodo(req, res) {
  const todoId = req.params.id;

  const todo = await Todo.findByIdAndDelete(todoId);

  return res
    .status(200)
    .json({ todo: todo.toJSON() });
}
