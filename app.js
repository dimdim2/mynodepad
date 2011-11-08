
/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes'),
	mongoose = require('mongoose'),
	db,
	Document;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.logger({ format: ':method :uri'}));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true}));
	db = mongoose.connect('mongodb://localhost/nodepad-development');
});

app.configure('production', function(){
  app.use(express.logger());
  app.use(express.errorHandler()); 
	db = mongoose.connect('mongodb://localhost/nodepad-production');
});

app.configure('test', function() {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true}));
	db = mongoose.connect('mongodb://localhost/nodepad-test');
});

// Routes

app.get('/', function(req, res) {
	res.render('index.jade', {
		title : "title"
	});
});

// List
app.get('/documents.:format?', function(req, res) {
	Documents.find().all(function(documents) {
		switch (req.params.format) {
			case 'json' :
				res.send(documents.map(function(d) {
					return d.__doc;
				}));
			break;
			
			default:
				res.render('documents/index.jade');
		}
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
});

// Update
app.put('/documents/:id.:format?', function(req, res) {
});

// Delete
app.del('/documents/:id.:format?', function(req, res) {
});

if(!module.parent) {
	app.listen(3000);
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}
