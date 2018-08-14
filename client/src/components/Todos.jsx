import React, { Component } from 'react';
import {
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Typography,
  Paper,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import {
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
} from '@material-ui/icons';
import { Redirect } from 'react-router-dom';
import * as moment from 'moment';

import { Spinner } from './Spinner';
import { AlertType } from './Alert';
import { AppContext } from './AppContext';
import { withContext } from 'util/context';
import { fieldValue, fieldHasError, fieldErrorText, withForm } from 'util/form';
import { extractErrors, formatErrors } from 'util/errors';

const FieldName = {
  newTodoDescription: 'newTodoDescription',
};
const constraints = {
  [FieldName.newTodoDescription]: {
    presence: { allowEmpty: false },
  },
};

class _Todos extends Component {
  constructor(props) {
    super(props);

    this.state = {
      todos: {},
      isLoading: true,
    };
  }

  async componentDidMount() {
    const { requestWithAlert, authenticator } = this.props.context.utils;
    const response = await requestWithAlert
      .get('/api/v1/todos', authenticator.getToken());

    if (response.isSuccessful) {
      const todos = (await response.json()).todos;
      this.setState({ todos: this.transformTodos(todos) });
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getTodosFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ isLoading: false });
  }

  transformTodos = (responseTodos) => {
    return responseTodos.reduce((todos, todo) => {
      todos[todo.id] = this.transformTodo(todo);
      return todos;
    }, {});
  }

  transformTodo = (responseTodo) =>  {
    return {
      ...responseTodo,
      addedAt: moment(responseTodo.addedAt),
    };
  }

  addTodo = async () => {
    if (!this.props.validateAllFields()) {
      return;
    }

    const { newTodoDescription } = this.props.valuesForAllFields();
    const tempId = Object.keys(this.state.todos).length + 1;
    const todo = {
      description: newTodoDescription,
          isDone: false,
          addedAt: moment(),
    };

    // optimistically set state before saving to server
    this.setState({
      todos: {
        ...this.state.todos,
        [tempId]: todo,
      },
    });

    this.props.resetAllFields();

    const { requestWithAlert } = this.props.context.utils;
    const { showAlert } = this.props.context.updaters;

    const data = { todo };
    const handleError = () => {
      // remove todo from state
      const todos = { ...this.state.todos };
      delete todos[tempId];
      this.setState({ todos });

      // set field value
      this.props.setField(
        FieldName.newTodoDescription,
        newTodoDescription,
      );
    };
    const response = await requestWithAlert
      .onNetworkError(handleError)
      .post('/api/v1/todos', data);

    if (response.isSuccessful) {
      // sync todo state with server
      const todoFromServer = (await response.json()).todo;
      const updatedTodos = { ...this.state.todos };
      delete updatedTodos[tempId];
      this.setState({
        todos: {
          ...updatedTodos,
          [todoFromServer.id]: this.transformTodo(todoFromServer),
        },
      });
    }

    if (response.hasError) {
      handleError();
      const errors = await extractErrors(response);
      showAlert('addTodoFailure', AlertType.ERROR, formatErrors(errors));
    }
  }

  renderTodoInput = () => {
    const { fields, handleChange } = this.props;

    return (
      <ListItem>
        <IconButton color="secondary" onClick={this.addTodo}>
          <AddCircleIcon />
        </IconButton>
        <TextField
          label="Todo"
          type="text"
          name={FieldName.newTodoDescription}
          id={FieldName.newTodoDescription}
          placeholder="Your todo"
          value={fieldValue(fields, FieldName.newTodoDescription)}
          onChange={handleChange}
          error={fieldHasError(fields, FieldName.newTodoDescription)}
          helperText={fieldErrorText(fields, FieldName.newTodoDescription)}
          fullWidth
        />
      </ListItem>
    );
  }

  handleToggle = async (id) => {
    const todo = this.state.todos[id];
    const isDone = !todo.isDone;
    const updatedTodo = { ...todo, isDone };

    // optimistically update
    this.setState({
      todos: {
        ...this.state.todos,
        [id]: updatedTodo,
      },
    });

    const { requestWithAlert } = this.props.context.utils;
    const { showAlert } = this.props.context.updaters;

    const data = { todo: updatedTodo };
    const handleError = () => {
      // reset state
      this.setState({
        todos: {
          ...this.state.todos,
          [id]: todo,
        },
      });
    };
    const response = await requestWithAlert
      .onNetworkError(handleError)
      .put(`/api/v1/todos/${id}`, data);

    if (response.hasError) {
      handleError();
      const errors = await extractErrors(response);
      showAlert('updateTodoFailure', AlertType.ERROR, formatErrors(errors));
    }
  }

  handleDelete = async (id) => {
    const originalTodos = { ...this.state.todos };
    const updatedTodos = { ...this.state.todos };
    delete updatedTodos[id];
    this.setState({
      todos: updatedTodos,
    });

    const { requestWithAlert } = this.props.context.utils;
    const { showAlert } = this.props.context.updaters;

    const handleError = () => {
      // reset state
      this.setState({
        todos: originalTodos,
      });
    };
    const response = await requestWithAlert
      .onNetworkError(handleError)
      .delete(`/api/v1/todos/${id}`);

    if (response.hasError) {
      handleError();
      const errors = await extractErrors(response);
      showAlert('deleteTodoFailure', AlertType.ERROR, formatErrors(errors));
    }
  }

  renderTodos = () => {
    const { classes } = this.props;
    const todoIds = Object.keys(this.state.todos);

    return (
      <List>
        {this.renderTodoInput()}
        {todoIds.map(id => {
          const todo = this.state.todos[id];
          const todoTextClass = todo.isDone ? classes.doneTodo : '';
          const addedAtText = `Added ${todo.addedAt.format('D MMM YYYY')}`;

          return (
            <ListItem
              key={id}
              button
              onClick={() => this.handleToggle(id)}
            >
              <Checkbox
                checked={todo.isDone}
                color="primary"
                disableRipple
              />
              <ListItemText
                className={todoTextClass}
                primary={todo.description}
                secondary={addedAtText}
              />
              <ListItemSecondaryAction>
                <IconButton
                  aria-label="Delete"
                  onClick={() => this.handleDelete(id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    );
  }

  render() {
    const { classes } = this.props;
    const { isAuthenticated } = this.props.context;

    if (!isAuthenticated) {
      return <Redirect to="/todos/login" />;
    }

    return (
      <div>
        <Typography variant="display2" gutterBottom align="center">
          My Todos
        </Typography>
        <Paper className={classes.todoContainer}>
          {this.state.isLoading ? <Spinner /> : this.renderTodos()}
        </Paper>
      </div>
    );
  }
}

const styles = {
  doneTodo: {
    textDecoration: 'line-through',
  },
  todoContainer: {
    maxWidth: '600px',
    minHeight: '700px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
  },
};

export const Todos = withStyles(styles)(
  withContext(AppContext,
    withForm(
      FieldName,
      constraints,
    )(_Todos),
  ),
);
