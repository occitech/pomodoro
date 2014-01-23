var util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = Pomodoro;

util.inherits(Pomodoro, EventEmitter);
function Pomodoro(pomodoro_duration_in_min, rest_duration_in_min, tick_interval_in_sec) {
	this.config = {
		pomodoro_duration_ms: (pomodoro_duration_in_min || 25) * 60 * 1000,
		rest_duration_ms: (rest_duration_in_min || 5) * 60 * 1000,
		tick_interval_ms: (tick_interval_in_sec || 60) * 1000
	};

	this._started = false;
	this._resting = false;
	this._tickInterval = null;
}

Pomodoro.prototype.running = function() {
	return this._started;
};

Pomodoro.prototype.resting = function() {
	return this._resting;
};

Pomodoro.prototype.start = function() {
	if (this.running()) {
		throw new Error('Cannot start pomodoro already running');
	}
	this._started = true;

	this._tickInterval = setInterval(
		this.tick.bind(this),
		this.config.tick_interval_ms
	);
	setTimeout(stop.bind(this), this.config.pomodoro_duration_ms);

	this.emit('started', this);
};

Pomodoro.prototype.tick = function() {
	this.emit('ticked', this);
};

Pomodoro.prototype.interrupt = function() {
	if (!this.running()) {
		throw new Error('Cannot stop pomodoro already stopped');
	}
	this._started = false;
	clearInterval(this._tickInterval);
	this.emit('interrupted', this);
}

function stop() {
	if (this.running()) {
		this._started = false;
		this._resting = true;
		this.emit('stopped', this);
		setTimeout(finishRest.bind(this), this.config.rest_duration_ms);
	}
}

function finishRest() {
	this._resting = false;
	this.emit('restEnded', this);
}
