/**
 * Node socket application for centralized pomodoros
 */

var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	port = Number(process.env.PORT || 1337),
	static = require('node-static'),
	file = new static.Server('./public', { cache: false }),
	Pomodoro = require('./pomodoro');

function handler(request, response) {
	request.addListener('end', function () {
		file.serve(request, response);
	}).resume();
}

app.listen(port, function() {
	console.log("Listening on http://localhost:" + port);
});

var pomodoroConfig = {
	duration_in_minutes: 25,
	rest_in_minutes: 5
};
var tick_interval_in_sec = 1;
var pomodoro = new Pomodoro(
	pomodoroConfig.duration_in_minutes,
	pomodoroConfig.rest_in_minutes,
	tick_interval_in_sec
);
var remainingSeconds = 0;
pomodoro.on('started', function() {
	remainingSeconds = pomodoroConfig.duration_in_minutes * 60;
	io.sockets.emit('started', remainingSeconds);
});
pomodoro.on('ticked', function() {
	remainingSeconds -= tick_interval_in_sec;
	io.sockets.emit('ticked', remainingSeconds);
});
pomodoro.on('stopped', function() {
	remainingSeconds = 0;
	io.sockets.emit('stopped', remainingSeconds);
});
pomodoro.on('restEnded', function() {
	io.sockets.emit('restEnded', {});
});

io.sockets.on('connection', function (socket) {
	socket.emit('new Pomodoro', {
		config: pomodoroConfig
	});
	socket.on('start', function (socket) {
		console.log('STARTING POMODORO');
		pomodoro.start();
	});
});