var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');

var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

// GET /todos
app.get('/todos', function(req, res) {
  res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id,10);

  var retTodo = _.findWhere(todos, {id: todoId});

  if (typeof retTodo === 'undefined') {
    res.status(404).send();
  } else {
    res.json(retTodo);
  }
});

// POST /todos/:id
app.post('/todos', function(req, res) {
  var body = _.pick(req.body, 'description', 'completed' );

  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    return res.status(400).send();
  }
  body.description = body.description.trim();

  body.id = todoNextId++;
  todos.push(body);
  res.json(body);
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


app.listen(PORT, function () {
 console.log('Express listening on port ' + PORT + '!');
});
