exports.testAsync = function(beforeExit, assert) {
	var n = 0;
	setTimeout(function() {
		++n;
		assert.ok(true);
	}, 200);

	setTimeout(function() {
		++n;
		assert.ok(true);
	}, 200);

	this.on('exit', function() {
		assert.equal(2, n, 'Ensure both timeoiuts are called');
	});

	beforeExit(function() {
		assert.equals(2, n, 'Ensure both timeouts are called');
	});
};
