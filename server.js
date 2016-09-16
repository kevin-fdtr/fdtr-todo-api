var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

//GET /
app.get('/', function(req, res) {
  req.send('Todo API root');
});

//GET /todos?completed=
app.get('/todos', function(req, res) {
  var queryParams = req.query;
  var filteredTodos = todos;

  if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
    filteredTodos = _.where(filteredTodos, {completed: true});
  } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    filteredTodos = _.where(filteredTodos, {completed: false});
  }

  if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0) {
    filteredTodos = _.filter(filteredTodos, function(todo) {
      return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
    });
  }
  res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id,10);

  if (isNaN(todoId)) {
    return res.status(400).send();
  }

  db.todo.findById(todoId).then( function(todo) {
    if (!!todo) {
      res.json(todo.toJSON());
    } else {
      res.status(404).send();
    }
  }, function(e) {
    res.status(500).send();
  });
});

// POST /todos
app.post('/todos', function(req, res) {
  var body = _.pick(req.body, 'description', 'completed' );

  db.todo.create(body)
  .then( function(todo) {
    res.json(todo.toJSON());
  }, function(e) {
    res.status(400).json(e);
  });
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req,res) {
  var deleteId = parseInt(req.params.id,10);

  var deleteTodo = _.findWhere(todos, {id: deleteId});

    if (!deleteTodo) {
    res.status(404).send({"error": "No todo found with an id of " + deleteId});
  }
  else {
    todos = _.without(todos, deleteTodo);
    res.json(deleteTodo);
  }
});

// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
  var body = _.pick(req.body, 'description', 'completed' );
  var validAttributes = {};

  var updateId = parseInt(req.params.id,10);
  var updateTodo = _.findWhere(todos, {id: updateId});

  if (!updateTodo) {
    return res.status(404).send();
  }

  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty('completed')) {
    return res.status(400).send();
  }

  if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
    validAttributes.description = body.description;
  } else if (body.hasOwnProperty('description')) {
    return res.status(400).send();
  }

  _.extend(updateTodo, validAttributes);
  res.json(updateTodo);
});

app.get('/', function(req, res) {
  res.send('Todo API Root');
});

db.sequelize.sync().then( function() {
  app.listen(PORT, function () {
   console.log('Express listening on port ' + PORT + '!');
  });
});
