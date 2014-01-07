var util = require('util');
var EventEmitter = require('events').EventEmitter;

var TICK_INTERVAL_MS = 1 * 1000;
var POMODORO_DURATION_MS = 25 * 1000;

var Pomodoro = function() {
	this._started = false;
	this._tickInterval = null;
}
util.inherits(Pomodoro, EventEmitter);

Pomodoro.prototype.running = function() {
	return this._started;
};

Pomodoro.prototype.start = function() {
	this._started = true;

	this._tickInterval = setInterval(
		this.tick.bind(this),
		TICK_INTERVAL_MS
	);
	setTimeout(this.stop.bind(this), POMODORO_DURATION_MS);

	this.emit('started', this);
};

Pomodoro.prototype.tick = function() {
	this.emit('ticked', this);
};

Pomodoro.prototype.stop = function() {
	this._started = false;
}

Pomodoro.prototype.interrupt = function() {
	this._started = false;
	clearInterval(this._tickInterval);
	this.emit('interrupted', this);
}

module.exports = Pomodoro;