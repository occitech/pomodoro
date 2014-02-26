/**
 * Node socket application for centralized pomodoros
 */

var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	port = Number(process.env.PORT || 1337),
	static = require('node-static'),
	file = new static.Server('./public', { cache: false });

function handler(request, response) {
	request.addListener('end', function () {
		file.serve(request, response);
	}).resume();
}

app.listen(port, function() {
	console.log("Listening on http://localhost:" + port);
});

io.sockets.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});
});