var Pomodoro = require('./../../pomodoro');
require('angular');

angular.module('pomodoro', [])
	.factory('Pomodoro', [function() {
		return Pomodoro;
	}])
	.controller('PomodoroCtrl', ['$scope', 'Pomodoro', function($scope, Pomodoro) {
		var pomodoro = new Pomodoro(1, 2, 1),
			remainingSeconds = 0;

		$scope.pomodoro = pomodoro;

		pomodoro.on('ticked', function() {
			$scope.$apply(function() {
				remainingSeconds -= 1;
			});
		});

		pomodoro.on('started', function() {
			remainingSeconds = 1 * 60;
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