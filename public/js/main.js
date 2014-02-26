var Pomodoro = require('./../../pomodoro');
var io = require('socket.io-client');
var socket = io.connect('http://localhost:1337');

require('angular');

socket.on('news', function (data) {
	console.log(data);
	socket.emit('my other event', { my: 'data' });
});

angular.module('pomodoro', [])
	.factory('Pomodoro', [function() {
		return Pomodoro;
	}])
	.controller('PomodoroCtrl', ['$scope', 'Pomodoro', function($scope, Pomodoro) {
		var pomodoro,
			remainingSeconds = 0;

		$scope.configuration = {
			duration_in_minutes: 25,
			rest_in_minutes: 5
		};
		pomodoro = new Pomodoro(
			$scope.configuration.duration_in_minutes,
			$scope.configuration.rest_in_minutes,
			1 // seconds
		);
		$scope.pomodoro = pomodoro;

		pomodoro.on('ticked', function() {
			$scope.$apply(function() {
				remainingSeconds -= 1;
			});
		});

		pomodoro.on('started', function() {
			remainingSeconds = $scope.configuration.duration_in_minutes * 60;
		});

		pomodoro.on('restEnded', function() {
			alert('Au boulot !');
		});

		pomodoro.on('stopped', function() {
			$scope.$apply(function() {
				remainingSeconds = 0;
			});
		});

		$scope.remainingMinutes = function() {
			return parseInt(remainingSeconds / 60);
		}
		$scope.remainingSeconds = function() {
			return remainingSeconds % 60;
		}
	}]);