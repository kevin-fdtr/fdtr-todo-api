var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

//GET /
app.get('/', function(req, res) {
  res.send('Todo API root');
});

//GET /todos?completed=
app.get('/todos', middleware.requireAuthentication, function(req, res) {
  var query = req.query;

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

  var where = {
    where: {
      userid: req.user.get('id')
    }
  };

  db.todo.findAll(where).then( function(todos) {
    res.json(todos);
  }, function(e) {
    console.log(e);
    res.status(500).send();
  });
});

// GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
  var todoId = parseInt(req.params.id,10);

  if (isNaN(todoId)) {
    return res.status(400).send();
  }

  var where = {
    where: {
      userid: req.user.get('id'),
      id: todoId
    }
  };

  db.todo.findOne(where).then( function(todo) {
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
app.post('/todos', middleware.requireAuthentication, function(req, res) {
  var body = _.pick(req.body, 'description', 'completed' );

  db.todo.create(body)
  .then( function(todo) {
    req.user.addTodo(todo).then( function() {
      return todo.reload();
    }).then( function() {
      res.json(todo.toJSON());
    });
  }, function(e) {
    res.status(400).json(e);
  });
});

// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req,res) {
  var deleteId = parseInt(req.params.id,10);
  if (isNaN(deleteId)) {
    return res.status(400).send();
  }

  var where = {
    where: {
      userid: req.user.get('id'),
      id: deleteId
    }
  };

  db.todo.destroy(where).then( function (deleted) {
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
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
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

  var where = {
    where: {
      userid: req.user.get('id'),
      id: updateId,
    }
  }

  db.todo.findOne(where).then( function(todo) {
    if (todo) {
      todo.update(attributes).then( function (todo) {
        res.json(todo.toJSON());
      }, function(e) {
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

// POST /users
app.post('/users', function(req, res) {
  var body = _.pick(req.body, 'email', 'password' );

  db.user.create(body)
  .then( function(user) {
    res.json(user.toPublicJSON());
  }, function(e) {
    res.status(400).json(e);
  });
});

// POST /users/login
app.post('/users/login', function(req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.authenticate(body).then( function(user) {
    var token = user.generateToken('authentication');
    if (token) {
      res.header('Auth', token).json(user.toPublicJSON());
    } else {
      res.status(401).send();
    }
  }, function() {
    res.status(401).send();
  });
});

db.sequelize.sync(
  {force:true}
).then( function() {
  app.listen(PORT, function () {
   console.log('Express listening on port ' + PORT + '!');
  });
});
