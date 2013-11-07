var SCALE_LENGTH = 7,
	BONUS_CLIMBS = 2,
	MAX_POINTS = 10;


angular.module('tt', ['ngResource', 'ngStorage'])
	.filter('reverse', function() {
		return function(items) {
			return items.slice().reverse();
		};
	})
	.filter('sexypoints', function () {
		return function(points) {
			return Math.floor(points * 100);
		};
	})
	.service('Session', function (ClimbingTypes) {
		this.climbingType = ClimbingTypes[0];
		this.projectLevel = ClimbingTypes[0].scale[0];
		this.goal = 100;
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

function calculatePoints(rating, scale, bestClimb) {
	var maxPointIndex = scale.indexOf(bestClimb),
		bonus = MAX_POINTS/4,
		index = scale.indexOf(rating),
		slope = MAX_POINTS / (SCALE_LENGTH-1);

	if (index > maxPointIndex) {
		return MAX_POINTS + bonus * (index - maxPointIndex);
	}

	return MAX_POINTS - slope * (maxPointIndex - index);
}

function SetupCtrl($scope, ClimbingTypes, Session) {
	$scope.types = ClimbingTypes;
	$scope.session = Session;
	$scope.$watch('session.climbingType', function (newValue) {
		$scope.session.projectLevel = newValue.scale[0];
	});
}

function TicklistCtrl($scope, $localStorage, ClimbingTypes, Session) {
	var storage = $scope.$storage = $localStorage.$default({
		ticks: []
	});
	
	$scope.session = Session;
	$scope.climbingScale = function () {
		var upperBound;

		upperBound = Session.climbingType.scale.indexOf(Session.projectLevel) + BONUS_CLIMBS + 1;
		if (upperBound >= Session.climbingType.scale.length) upperBound = Session.climbingType.scale.length;

		return Session.climbingType.scale.slice(0, upperBound).slice(-SCALE_LENGTH);
	};

	$scope.totalPoints = function () {
		var sum = 0;
		storage.ticks.forEach(function (tick) {
			sum += tick.points;
		});
		return sum;
	};

	$scope.remainingPoints = function () {
		var goal = Session.goal;
		var total = $scope.totalPoints();
		var remaining = goal - total;
		return remaining < 0 ? 0 : remaining;
	};

	$scope.newList = function () {
		storage.ticks = [];
	};

	$scope.addTick = function (rating) {
		if (!rating) return;

		storage.ticks.push({ 
			description: rating, 
			climbingType: $scope.session.climbingType, 
			points: calculatePoints(rating, $scope.climbingScale(), $scope.session.projectLevel)
		});
	};

	$scope.removeTick = function (tick) {
		storage.ticks.splice(storage.ticks.indexOf(tick), 1);
	};
}