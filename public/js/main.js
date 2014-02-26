var io = require('socket.io-client');
var socket = io.connect('http://localhost:1337');

require('angular');

angular.module('pomodoro', [])
	.service('pomodoro', ['$rootScope', function($rootScope) {
		var config = {};
		var callbacks = {};
		var pomodoro = null;
		var remainingSeconds = 0;

		function updateRemainingTime(remaining) {
			console.log('remaining updated ', remaining);
			$rootScope.$apply(function() {
				remainingSeconds = remaining;
			})
		}

		socket.on('new Pomodoro', function (data) {
			console.log(data);
			config = data.config;
			pomodoro = data.pomodoro;
		});

		['started', 'ticked', 'stopped'].forEach(function(eventName) {
			socket.on(eventName, updateRemainingTime);
		});

		return {
			config: function() {
				return config;
			},
			remainingSeconds: function() {
				return remainingSeconds;
			},
			start: function() {
				console.log('pomodoro start requested');
				socket.emit('start', {});
			},
			on: function(eventName, cb) {
				socket.on(eventName, cb);
				console.log('callback registered on ', eventName);
			}
		}
	}])
	.controller('PomodoroCtrl', ['$scope', 'pomodoro', function($scope, pomodoro) {
		$scope.configuration = pomodoro.config;
		$scope.pomodoro = pomodoro;

		pomodoro.on('restEnded', function() {
			alert('Au boulot !');
		});

		$scope.remainingMinutes = function() {
			return parseInt(pomodoro.remainingSeconds() / 60);
		};
		$scope.remainingSeconds = function() {
			return pomodoro.remainingSeconds() % 60;
		};
	}]);