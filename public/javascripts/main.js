angular.module('tt', ['ngResource', 'ngStorage'])
	.filter('reverse', function() {
		return function(items) {
			return items.slice().reverse();
		};
	});

var vScale = [
	{
		points: 6,
		description: 'VB'
	},
	{
		points: 7,
		description: 'V0'
	},
	{
		points: 8,
		description: 'V1'
	},
	{
		points: 9,
		description: 'V2'
	},
	{
		points: 10,
		description: 'V3'
	}
];

var yosemiteScale = [
	{
		points: 6,
		description: '5.6'
	},
	{
		points: 7,
		description: '5.7'
	},
	{
		points: 8,
		description: '5.8'
	},
	{
		points: 9,
		description: '5.9'
	},
	{
		points: 10,
		description: '5.10'
	}
];

function TicklistCtrl($scope, $localStorage) {
	var storage = $scope.$storage = $localStorage.$default({
		ticks: []
	});

	$scope.climbs = {
		'top rope': yosemiteScale,
		'sport': yosemiteScale,
		'bouldering': vScale
	};

	$scope.totalPoints = function () {
		var sum = 0;
		storage.ticks.forEach(function (tick) {
			sum += tick.points;
		});
		return sum;
	};

	$scope.remainingPoints = function () {
		var goal = 100;
		var total = $scope.totalPoints();
		var remaining = goal - total;
		return remaining < 0 ? 0 : remaining;
	};

	$scope.newList = function () {
		storage.ticks = [];
	};

	$scope.addTick = function (climbingType, climb) {
		if (!climbingType || !climb) return;
		climb.climbingType = climbingType;

		storage.ticks.push(climb);
	};

	$scope.removeTick = function (tick) {
		storage.ticks.splice(storage.ticks.indexOf(tick), 1);
	};
}