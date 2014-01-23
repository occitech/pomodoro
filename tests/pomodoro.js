var Pomodoro = require('../pomodoro'),
	sinon = require('sinon'),
	chai = require('chai'),
	expect = chai.expect,
	sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('Pomodoro', function() {
	var subject;
	var MINUTE_IN_MS = 60 * 1000;

	beforeEach(function () {
		subject = new Pomodoro;
	});

	describe('constructor', function() {
		it('should be a Pomodoro instance', function() {
			expect(subject).to.be.an.instanceof(Pomodoro);
		});
		it('should not be running', function() {
			expect(subject.running()).to.be.false;
		});
		it('should not be resting', function() {
			expect(subject.resting()).to.be.false;
		});
	});

	describe('start', function() {
		var startListener;
		beforeEach(function () {
			startListener = sinon.spy();
			subject.on('started', startListener);
			subject.start();
		});
		afterEach(function() {
			startListener.reset();
		});

		it('should be make the Pomodoro run', function() {
			expect(subject.running()).to.be.true;
			var newSubj = new Pomodoro;
			expect(newSubj.running()).to.be.false;
			expect(subject.running()).to.be.true;
		});
		it('should emit started event', function() {
			expect(startListener).to.have.been.calledOnce;
		});
		it('should pass the pomodoro instance when emitting the started event', function() {
			expect(startListener).to.have.been.calledWith(subject);
		});
		it('should throw Exception if already running', function() {
			expect(subject.start.bind(subject)).to.throw('Cannot start pomodoro already running');
		});
	});

	describe('execution', function() {
		var clock;
		var tickListener;

		beforeEach(function () {
			clock = sinon.useFakeTimers();
			tickListener = sinon.spy();
			stopListener = sinon.spy();
			subject.on('ticked', tickListener);
			subject.on('stopped', stopListener);
			subject.start();
		});
		afterEach(function() {
			clock.restore();
			tickListener.reset();
			stopListener.reset();
		});

		it('should be stopped after 25 minutes', function(){
			clock.tick(25 * MINUTE_IN_MS + 1);
			expect(subject.running()).to.be.false;
		});
		it('should emit stopped event after 25 minutes', function(){
			clock.tick(25 * MINUTE_IN_MS);
			expect(stopListener).to.have.been.called;
		});

		it('should pass the pomodoro instance when emitting the stopped event', function(){
			clock.tick(25 * MINUTE_IN_MS);
			expect(stopListener).to.have.been.calledWith(subject);
		});

		it('should emit ticked event every minute', function(){
			clock.tick(5 * MINUTE_IN_MS);
			expect(tickListener.callCount).to.be.equal(5);
		});
		it('should pass the pomodoro instance when emitting the ticked event', function() {
			clock.tick(5 * MINUTE_IN_MS);
			expect(tickListener).to.have.been.calledWith(subject);
		});

		describe('rest', function() {
			var restListener;

			beforeEach(function(){
				restListener = sinon.spy();
				subject.on('restEnded', restListener);
				clock.tick(25 * MINUTE_IN_MS);
			});
			it('should emit event to say rest is over after 25 + 5 minutes', function(){
				clock.tick(5 * MINUTE_IN_MS);
				expect(restListener).to.have.been.called;
			});
			it('should pass the pomodoro instance when emitting the restEnded event', function() {
				clock.tick(5 * MINUTE_IN_MS);
				expect(restListener).to.have.been.calledWith(subject);
			});
			it('should be resting', function() {
				expect(subject.resting()).to.be.true;
			});
			it('should not be resting anymore after 25 + 5 minutes', function() {
				clock.tick(5 * MINUTE_IN_MS);
				expect(subject.resting()).to.be.false;
			});
		});

	});

	describe('interrupt', function() {
		var interruptListener;
		var tickListener;
		var clock;

		beforeEach(function () {
			clock = sinon.useFakeTimers();
			interruptListener = sinon.spy();
			tickListener = sinon.spy();
			stopListener = sinon.spy();

			subject.on('ticked', tickListener);
			subject.on('interrupted', interruptListener);
			subject.on('stopped', stopListener);

			subject.start();
			subject.interrupt();
		});
		afterEach(function() {
			clock.restore();
			interruptListener.reset();
			tickListener.reset();
			stopListener.reset();
		});

		it('should be stopped', function(){
			expect(subject.running()).to.be.false;
		});
		it('should not be resting', function(){
			expect(subject.resting()).to.be.false;
		});
		it('should emit an interrupted event', function() {
			expect(interruptListener).to.have.been.calledOnce;
		});
		it('should pass the pomodoro instance when emitting the interrupted event', function() {
			expect(interruptListener).to.have.been.calledWith(subject);
		});
		it('should not emit ticked event every minute', function(){
			clock.tick(5 * MINUTE_IN_MS);
			expect(tickListener).to.not.have.been.called;
		});
		it('should not emit stopped event after 25 minutes', function(){
			clock.tick(25 * MINUTE_IN_MS);
			expect(stopListener).to.not.have.been.called;
		});
		it('should throw Exception if already stopped', function() {
			expect(subject.interrupt.bind(subject)).to.throw('Cannot stop pomodoro already stopped');
		});
	});

	describe('configuration', function() {
		var clock;
		var listener;

		beforeEach(function() {
			clock = sinon.useFakeTimers();
			listener = sinon.spy();
		});
		afterEach(function() {
			clock.restore();
			listener.reset();
		});

		describe('custom activity duration in minutes', function() {
			beforeEach(function() {
				subject = new Pomodoro(30);
				subject.start();
				subject.on('stopped', listener);
			});

			it('should not emit stopped event before 30 minutes', function() {
				clock.tick(30 * MINUTE_IN_MS - 1);
				expect(listener).to.not.have.been.called;
			});
			it('should emit stopped event after 30 minutes', function() {
				clock.tick(30 * MINUTE_IN_MS);
				expect(listener).to.have.been.called;
			});
		});

		describe('custom rest duration in minutes', function() {
			beforeEach(function() {
				subject = new Pomodoro(25, 10);
				subject.start();
				subject.on('restEnded', listener);
			});

			it('should not emit restEnded event before 35 minutes', function() {
				clock.tick(35 * MINUTE_IN_MS - 1);
				expect(listener).to.not.have.been.called;
			});
			it('should emit stopped event after 35 minutes', function() {
				clock.tick(35 * MINUTE_IN_MS);
				expect(listener).to.have.been.called;
			});
		});

		describe('custom tick duration in seconds', function() {
			beforeEach(function() {
				subject = new Pomodoro(25, 5, 2);
				subject.start();
				subject.on('ticked', listener);
			});

			it('should not emit ticked event before 2 seconds', function() {
				clock.tick(2 * 1000 - 1);
				expect(listener).to.not.have.been.called;
			});
			it('should emit ticked event after 2 seconds', function() {
				clock.tick(2 * 1000);
				expect(listener).to.have.been.called;
			});
		});

	});
});
