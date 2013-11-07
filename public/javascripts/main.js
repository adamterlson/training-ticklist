var SCALE_LENGTH = 7,
	BONUS_CLIMBS = 2,
	MAX_POINTS = 10;


angular.module('tt', ['ngResource'])
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
	.factory('SessionStorage', function () {
		var STORAGE_ID = 'tt-storage';
		return {
			get: function () {
				return JSON.parse(localStorage.getItem(STORAGE_ID) || null);
			},

			put: function (state) {
				localStorage.setItem(STORAGE_ID, JSON.stringify(state));
			}
		};
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

function MainCtrl($scope, SessionStorage, ClimbingTypes) {
	var state = SessionStorage.get();

	if (!state) {
		state = {
			climbingType: ClimbingTypes[0].name,
			projectLevel: ClimbingTypes[0].scale[0],
			goal: 50,
			ticks: []
		};
	}

	$scope.session = state;
	$scope.$watch('session', function (newValue, oldValue) {
		if (newValue.climbingType !== oldValue.climbingType) {
			newValue.projectLevel = $scope.fullScale()[0];
		}
		SessionStorage.put(newValue)
	}, true);

	$scope.fullScale = function () {
		return _.find(ClimbingTypes, { name: state.climbingType }).scale;
	}
}

function SetupCtrl($scope, ClimbingTypes) {
	console.log($scope.session.projectLevel);
	$scope.types = _.map(ClimbingTypes, 'name');
}

function TicklistCtrl($scope, ClimbingTypes) {
	var state = $scope.session;

	$scope.climbingScale = function () {
		var upperBound,
			scale = _.find(ClimbingTypes, { name: state.climbingType }).scale;

		upperBound = scale.indexOf(state.projectLevel) + BONUS_CLIMBS + 1;
		if (upperBound >= scale.length) upperBound = scale.length;

		return scale.slice(0, upperBound).slice(-SCALE_LENGTH);
	};

	$scope.totalPoints = function () {
		var sum = 0;
		state.ticks.forEach(function (tick) {
			sum += tick.points;
		});
		return sum;
	};

	$scope.remainingPoints = function () {
		var goal = state.goal;
		var total = $scope.totalPoints();
		var remaining = goal - total;
		return remaining < 0 ? 0 : remaining;
	};

	$scope.newList = function () {
		state.ticks = [];
	};

	$scope.addTick = function (rating) {
		if (!rating) return;

		state.ticks.push({ 
			description: rating, 
			climbingType: state.climbingType, 
			points: calculatePoints(rating, $scope.climbingScale(), state.projectLevel)
		});
	};

	$scope.removeTick = function (tick) {
		state.ticks.splice(state.ticks.indexOf(tick), 1);
	};
}