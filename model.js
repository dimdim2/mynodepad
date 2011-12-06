var mongoose = require('mongoose');
var crypto = require('crypto');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

// 스키마의 인스턴스가 모델이다.
// Document는 모델을 의미 (즉, model은 Document를 생성하는 템플릿??)
Document = new Schema({
  'title': { type: String, index: true },
  'data': String,
  'tags': [String],
  'user_id': ObjectId
});

Document.virtual('id')
  .get(function() {
    return this._id.toHexString();
  });

// 몽구스에게 만들어진 문서 알려주기
mongoose.model('Document', Document);

mongoose.mode('User', {
	
	indexes: [
		[{ email: 1}, {unique: true}]
	],

	setters: {
		password: function(password) {
			this._password = password;
			this.salt = this.makeSalt();
			this.hashed_password = this.encryptPassword(password);
		}
	},

	methods: {
		authenticate: function(plainText) {
			return this.encryptPassword(plainText) === this.hashed_password;
		},
	
		makeSalt: function() {
			return Math.round((new Date().valueOf() * Math.random())) + '';
		},

		encryptPassword: function(password) {
			return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
		},

		save: function(okFn, failedFn) {
			if(this.isValid()) {
				this.__super__(okFn);
			} else {
				failedFn();
			}
		}
	}
});


// Document 함수를 exports한다.
// 여기서 인자로 넘긴 'Document'는 model을 의미
// db인자는 mongoose connection을 의미
exports.Document = function(db) {
    return db.model('Document');
};
