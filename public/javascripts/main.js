angular.module('tt', ['ngResource', 'ngStorage'])
	.filter('reverse', function() {
		return function(items) {
			return items.slice().reverse();
		};
	})
	.factory('SessionService', function (ClimbingTypes) {
		var session = {
			climbingType: ClimbingTypes[0],
			projectLevel: ClimbingTypes[0].scale[0],
			goal: 100
		};

		return session;
	})
	.service('ClimbingTypes', function () {
		var vScale = ['VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'];
		var yosemiteScale = ['5.6', '5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d', '5.12a', '5.12b', '5.12c', '5.12d'];
		var climbingTypes = [
			{ name: 'top rope', scale: yosemiteScale },
			{ name: 'sport', scale: yosemiteScale },
			{ name: 'bouldering', scale: vScale }
		];

		return climbingTypes;
	});

function SetupCtrl($scope, ClimbingTypes, SessionService) {
	$scope.types = ClimbingTypes;
	$scope.session = SessionService;
}

function TicklistCtrl($scope, $localStorage, ClimbingTypes, SessionService) {
	var storage = $scope.$storage = $localStorage.$default({
		ticks: []
	});

	$scope.climbingTypes = ClimbingTypes;
	$scope.session = SessionService;

	$scope.totalPoints = function () {
		var sum = 0;
		storage.ticks.forEach(function (tick) {
			sum += tick.points;
		});
		return sum;
	};

	$scope.remainingPoints = function () {
		var goal = SessionService.goal;
		var total = $scope.totalPoints();
		var remaining = goal - total;
		return remaining < 0 ? 0 : remaining;
	};

	$scope.newList = function () {
		storage.ticks = [];
	};

	$scope.addTick = function ( rating) {
		if (!rating) return;
		storage.ticks.push({ description: rating, climbingType: $scope.session.climbingType, points: 10 });
	};

	$scope.removeTick = function (tick) {
		storage.ticks.splice(storage.ticks.indexOf(tick), 1);
	};
}