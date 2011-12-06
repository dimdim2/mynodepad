
/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes'),
	mongoose = require('mongoose'),
	jade = require('jade'),
	Document;

var db = mongoose.connect('mongodb://localhost/nodepad');

var app = module.exports = express.createServer();
app.Document = Document = require('./model.js').Document(db);

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon()); 
	app.use(express.bodyParser());
	app.use(express.cookieDecoder());
	app.use(express.session());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.logger({ format: ':method :uri'}));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true}));
});

app.configure('production', function(){
	app.use(express.logger());
	app.use(express.errorHandler()); 
});

app.configure('test', function() {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true}));
});

function mongoStoreConnectionArgs() {
	return {
		dbname: db.db.databaseName,
		host: db.db.serverConfig.host,
		port: db.db.serverConfig.port,
		username: db.uri.username,
		password: db.uri.password
	};
}

app.use(express.session({
	store : mongoStore(mongoStoreConnectionArgs())
}));

function loadUser(req, res, next) {
	if(req.session.user_id) {
		User.findById(req.session.user_id, function(user) {
			if(user) {
				req.currentUser = user;
				next();
			} else {
				res.redirect('/sessions/new');
			}
		});
	} else {
		res.redirect('/sessions/new');
	}
}


// Routes

app.get('/sessions/new', function(req, res) {
	res.render('sessions/new.jade', {
		locals: { user: new User() }
	});
});

app.post('/sessions', function(req, res) {

});

app.del('/sessions', loadUser, function(req, res) {
	if(req.session) {
		req.session.destroy(function() {});
	}
	res.redirect('/sessions/new');
});

app.post('/users.:format?', function(req, res) {
	var user = new User(req.body.user);
	
	function userSaved() {
		switch (req.params.format) {
			case 'json':
				res.send(user.__doc);
				break;
			default: 
				req.setssion.user_id = user.id;
				res.redirect('/documents');
		}
	}

	function userSaveFailed() {
		res.render('users/new.jade', {
			locals: {user: user}
		});
	}

	user.save(userSaved, userSaveFailed);
}


app.get('/', function(req, res) {
/*
	res.render('index.jade', {
		title : "title"
	});
*/
	res.redirect('/documents');
});

// List
app.get('/documents.:format?', loadUser, function(req, res) {
	Document.find({}, function(err, docs) {
		switch (req.params.format) {
			case 'json' :
				res.send(docs.map(function(d) {
					return d.__doc;
				}));
			break;
			
			default:
				res.render('documents/index.jade', {
					locals: { docs: docs }
				});
		}
	});
});

// Update Form
app.get('/documents/:id.:format?/edit', function(req, res) {
	Document.findById(req.params.id, function(err, d) {
		res.render('documents/edit.jade', {
			locals: {d : d}
		});
	});
});

app.get('/documents/new', function(req, res) {
  res.render('documents/new', {
    locals: { d: new Document() }
  });
});

// Create
app.post('/documents.:format?', function(req, res) {
	var document = new Document(req.body['document']);
	document.save(function() {
		switch(req.params.format) {
			case 'json':
				res.send(document.__doc);
				break;
			default:
				res.redirect('/documents');
		}
	});
});

// Read 
app.get('/documents/:id.:format?', function(req, res) {
  Document.findById(req.params.id, function(err, d) {
    switch (req.params.format) {
      case 'json':
        res.send(d.__doc);
        break;

      default:
        res.render('documents/show.jade', {
          locals: { d: d }
        });
    }
  });
});

// Update
app.put('/documents/:id.:format?', function(req, res) {
	Document.findById(req.body.document.id, function(err, d) {
		d.title = req.body.document.title;
		d.data = req.body.document.data;
		
		d.save(function() {
			switch (req.params.format) {
				case 'json':
					res.send(d.__doc);
					break;
				
				default:
					res.redirect('/documents');
			}
		});
	});
});

// Delete
app.del('/documents/:id.:format?', function(req, res) {
	Document.findById(req.params.id, function(err, d) {
		d.remove(function(err) {
			switch (req.params.format) {
				case 'json':
					res.send('true');
					break;
				
				default:
					res.redirect('/documents');
			}
		});
	});
});

if(!module.parent) {
	app.listen(3000);
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}
