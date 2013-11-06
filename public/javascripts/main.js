angular.module('tt', ['ngResource']);

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

function TicklistCtrl($scope, $resource) {
	var Tick = $resource('api/ticks/:id', { id: '@id' });
	var ticks = $scope.ticks = Tick.query();

	$scope.climbs = {
		'top rope': yosemiteScale,
		'sport': yosemiteScale,
		'bouldering': vScale
	};

	$scope.totalPoints = function () {
		var sum = 0;
		ticks.forEach(function (tick) {
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

	$scope.addTick = function (climbingType, climb) {
		if (!climbingType || !climb) return;
		var tick = new Tick(climb);
		tick.climbingType = climbingType;

		tick.$save();
		ticks.push(tick);
	};

	$scope.removeTick = function (tick) {
		tick.$delete();
		ticks.splice(ticks.indexOf(tick), 1);
	};
}