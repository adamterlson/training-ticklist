tt.controller('GuidedModeCtrl', function GuidedModeCtrl($scope, ClimbingTypes, program, programs) {
	var state = $scope.state;
	state.program = 'guided';

	program.projectLevel = state.projectLevel;

	if (!program.current) {
		program.climb();
	}
	$scope.program = program;
	$scope.programs = programs;

	$scope.$watch('state.projectLevel', function (newValue, oldValue) {
		if (newValue === oldValue) return;

		program.projectLevel = newValue;
	});

	$scope.$watch('program.numberOfClimbs + program.type', function (newValue, oldValue) {
		if (newValue === oldValue) return;

		program.reset();
	});
});