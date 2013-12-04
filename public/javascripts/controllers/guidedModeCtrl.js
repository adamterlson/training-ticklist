tt.controller('GuidedModeCtrl', function GuidedModeCtrl($scope, ClimbingTypes, Programs) {
	var state = $scope.state;
	state.program = 'guided';

	var options = $scope.options = {
		type: 'linear',
		goal: ClimbingTypes[0].scale.indexOf(state.projectLevel) + 1,
		totalClimbs: 10
	};

	$scope.program = Programs.get(options);

	$scope.reset = function () {
		$scope.program = Programs.get(options);
	}
});