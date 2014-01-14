var Pomodoro = require('../pomodoro'),
	sinon = require('sinon'),
	chai = require('chai'),
	expect = chai.expect,
	sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('Pomodoro', function() {
	var subject;
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
			clock.tick(25*1000 + 1);
			expect(subject.running()).to.be.false;
		});
		it('should emit stopped event after 25 minutes', function(){
			 clock.tick(25*1000);
			expect(stopListener.callCount).to.have.been.call;
		});

		it('should pass the pomodoro instance when emitting the stopped event', function(){
			 clock.tick(25*1000);
			expect(stopListener).to.have.been.calledWith(subject);
		});

		it('should emit ticked event every minute', function(){
			clock.tick(5*1000);
			expect(tickListener.callCount).to.be.equal(5);
		});
		it('should pass the pomodoro instance when emitting the ticked event', function() {
			clock.tick(5*1000);
			expect(tickListener).to.have.been.calledWith(subject);
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
		it('should emit an interrupted event', function() {
			expect(interruptListener).to.have.been.calledOnce;
		});
		it('should pass the pomodoro instance when emitting the interrupted event', function() {
			expect(interruptListener).to.have.been.calledWith(subject);
		});
		it('should not emit ticked event every minute', function(){
			clock.tick(5 * 1000);
			expect(tickListener).to.not.have.been.called;
		});
		it('should not emit stopped event after 25 minutes', function(){
			clock.tick(25 * 1000);
			expect(stopListener).to.not.have.been.called;
		});
		it('should throw Exception if already stopped', function() {
			expect(subject.interrupt.bind(subject)).to.throw('Cannot stop pomodoro already stopped');
		});
	});
});
