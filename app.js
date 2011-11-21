
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

// Routes

app.get('/', function(req, res) {
/*
	res.render('index.jade', {
		title : "title"
	});
*/
	res.redirect('/documents');
});

// List
app.get('/documents.:format?', function(req, res) {
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
