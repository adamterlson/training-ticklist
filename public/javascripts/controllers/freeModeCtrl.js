tt.controller('FreeModeCtrl', function FreeModeCtrl($scope, ClimbingTypes) {
	var state = $scope.state;

	state.program = 'free';

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
		var scale;
		if (!rating) return;

		var points = calculatePoints(rating, $scope.climbingScale(), state.projectLevel);
		state.ticks.push({ 
			description: rating, 
			climbingType: state.climbingType, 
			points: points,
			special: points > MAX_POINTS
		});

		scale = $scope.climbingScale();
		if (scale.indexOf(state.projectLevel) < scale.indexOf(rating)) {
			state.projectLevel = rating;
		}
	};

	$scope.removeTick = function (tick) {
		state.ticks.splice(state.ticks.indexOf(tick), 1);
	};

	$scope.special = function (tick) {
		return tick
	}
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