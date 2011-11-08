var mongoose = require('mongoose').Mongoose;

mongoose.model('Documents', {
	properties: ['title', 'data', 'tags', 'user_id'],

	indexes: [ 'title', 'user_id' ]
});

