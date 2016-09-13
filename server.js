var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [
  {
    id: 1,
    description: "resign H&R",
    completed: false
  },{
    id: 2,
    description: "pet cat",
    completed: false
  },{
    id: 3,
    description: "go to bed",
    completed: true
  }
];

// GET /todos
app.get('/todos', function(req, res) {
  res.json(todos);
});
// GET /todos/:id
app.get('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id,10);
  var retTodo = todos.find(function(todo) {
    return todo.id === todoId;
  });
  if (typeof retTodo === 'undefined') {
    res.status(404).send();
  } else {
    res.json(retTodo);
  }

  //res.send('Request for todo id: = ' + req.params.id);
});

app.get('/', function(req, res) {
  res.send('Todo API Root');
});

app.listen(PORT, function () {
 console.log('Express listening on port ' + PORT + '!');
});
