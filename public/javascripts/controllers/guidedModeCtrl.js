tt.controller('GuidedModeCtrl', function GuidedModeCtrl($scope, ClimbingTypes, program) {
	var state = $scope.state;
	state.program = 'guided';

	program.projectLevel = state.projectLevel;
	program.setType = 'linear';

	if (!program.current) {
		program.climb();
	}
	$scope.program = program;

	$scope.$watch('program.numberOfClimbs', function (newValue, oldValue) {
		if (newValue === oldValue) return;

		program.reset();
	});
});