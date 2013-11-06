angular.module('tt', ['ngResource'])
	.filter('totalPoints', function () {
		return function (climbs) {
			var sum = 0;
			climbs.forEach(function (climb) {
				sum += climb.points;
			});
			return sum;
		};
	})
	.filter('remainingPoints', function ($filter) {
		return function (climbs) {
			var goal = 100;
			var total = $filter('totalPoints')(climbs);
			var remaining = goal - total;
			return remaining < 0 ? 0 : remaining;
		};
	});

function TicklistCtrl($scope, $resource) {
	var Tick = $resource('api/ticks/:id', { id: '@id' });
	var ticks = $scope.ticks = Tick.query();
	$scope.climbs = [
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
		},
	];

	$scope.remainingPoints = function () {}

	$scope.addTick = function () {
		if (!$scope.climb || !$scope.climb.points) return;
		var tick = new Tick($scope.climb);
		$scope.climb = '';
		tick.$save();
		ticks.push(tick);
	};

	$scope.removeTick = function (tick) {
		tick.$delete();
		ticks.splice(ticks.indexOf(tick), 1);
	};
}