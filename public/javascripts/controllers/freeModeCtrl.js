tt.controller('FreeModeCtrl', function FreeModeCtrl($scope, ClimbingTypes) {
	var state = $scope.state,
		scale = _.find(ClimbingTypes, { name: state.climbingType }).scale;

	state.program = 'free';

	$scope.scale = scale;

	$scope.climbingScale = function () {
		var upperBound;

		upperBound = state.projectLevel + BONUS_CLIMBS;
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
		rating = scale.indexOf(rating);
		var relativeScale = $scope.climbingScale();

		var points = calculatePoints(rating, relativeScale, state.projectLevel);
		state.ticks.push({ 
			description: scale[rating], 
			climbingType: state.climbingType, 
			points: points,
			rating: rating,
			special: $scope.score.is.special(rating),
			lame: $scope.score.is.lame(rating)
		});

		if (state.projectLevel <= rating) {
			state.projectLevel = rating;
		}
	};

	$scope.removeTick = function (tick) {
		state.ticks.splice(state.ticks.indexOf(tick), 1);
	};
});

function calculatePoints(rating, scale, bestClimb) {
	var maxPointIndex = bestClimb,
		bonus = MAX_POINTS/4,
		index = rating,
		slope = MAX_POINTS / (SCALE_LENGTH);

	if (index > maxPointIndex) {
		return MAX_POINTS + bonus * (index - maxPointIndex);
	}

	return MAX_POINTS - slope * (maxPointIndex - index);
}