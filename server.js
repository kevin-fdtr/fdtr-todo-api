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
  var query = req.query;
  var where = {};

  if (query.hasOwnProperty('completed') && query.completed === 'true') {
    where.completed = true;
  } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
    where.completed = false;
  } else if (query.hasOwnProperty('completed')) {
    return res.status(400).send({ error: 'completed can only be true or false'});
  }

  if (query.hasOwnProperty('q') && query.q.trim().length > 0) {
    where.description = {$like: '%' + query.q.trim() + '%'};
  }

  db.todo.findAll({ "where": where }).then( function(todos) {
    res.json(todos);
  }, function(e) {
    res.status(500).send();
  });
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
  if (isNaN(deleteId)) {
    return res.status(400).send();
  }

  db.todo.destroy({where: { id: deleteId}}).then( function (deleted) {
    if (deleted === 0) {
      res.status(404).send({"error": "No todo found with an id of " + deleteId});
    } else if (deleted ==1) {
      res.status(204).send();
    }
  }, function(e) {
    res.status(500).send();
  });
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
