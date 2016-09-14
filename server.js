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

  // var retTodo = todos.find(function(todo) {
  //   return todo.id === todoId;
  // });
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

app.get('/', function(req, res) {
  res.send('Todo API Root');
});


app.listen(PORT, function () {
 console.log('Express listening on port ' + PORT + '!');
});
