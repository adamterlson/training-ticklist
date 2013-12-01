tt.controller('GuidedModeCtrl', function GuidedModeCtrl($scope, ClimbingTypes, Programs) {
	var state = $scope.state;

	state.program = 'guided';

	var type = 'linear';

	$scope.program = Programs.get(type);
});