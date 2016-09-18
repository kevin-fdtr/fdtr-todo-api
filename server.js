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
console.log('req.params');
console.log(req.params);

  var updateId = parseInt(req.params.id,10);
console.log(updateId);
  if (isNaN(updateId)) {
    return res.status(400).send();
  }
  var body = _.pick(req.body, 'description', 'completed' );
  var attributes = {};

  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }
  console.log(attributes);
  db.todo.findById(updateId).then( function(todo) {
    if (todo) {
      console.log('update');
      todo.update(attributes).then( function (todo) {
        res.json(todo.toJSON());
      }, function(e) {
        console.log("error");
        res.status(404).json(e);
      });
    } else {
      res.status(404).send();
    }
  }, function () {
    res.status(500).send();
  });
});

app.get('/', function(req, res) {
  res.send('Todo API Root');
});

// POST /todos
app.post('/users', function(req, res) {
  var body = _.pick(req.body, 'email', 'password' );
console.log(body);
  db.user.create(body)
  .then( function(user) {
    res.json(user.toJSON());
  }, function(e) {
    res.status(400).json(e);
  });
});

db.sequelize.sync().then( function() {
  app.listen(PORT, function () {
   console.log('Express listening on port ' + PORT + '!');
  });
});
