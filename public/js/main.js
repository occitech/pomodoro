var Pomodoro = require('./../../pomodoro');
require('angular');

angular.module('pomodoro', [])
	.factory('Pomodoro', [function() {
		return Pomodoro;
	}])
	.controller('PomodoroCtrl', ['$scope', 'Pomodoro', function($scope, Pomodoro) {
		var pomodoro = new Pomodoro(1, 2, 1),
			remainingSeconds = 0;

		$scope.remainingSeconds = 0;
		$scope.pomodoro = pomodoro;

		$scope.pomodoro.on('ticked', function() {
			remainingSeconds -= 1;
			$scope.remainingSeconds = remainingSeconds % 60;
			console.log(remainingSeconds, $scope.remainingSeconds);
		});
		$scope.pomodoro.on('started', function() {
			remainingSeconds = 1 * 60;
		});

		$scope.start = function() {
			pomodoro.start();
		};
		$scope.interrupt = function() {
			pomodoro.interrupt();
		}
		$scope.remainingMinutes = function() {
			return parseInt(remainingSeconds / 60);
		}

		$scope.remainingSeconds =  0;
	}]);