tt.controller('GuidedModeCtrl', function GuidedModeCtrl($scope, ClimbingTypes, Programs) {
	var state = $scope.state;

	state.program = 'guided';

	var type = 'linear';

	$scope.program = Programs.get(type);

	$scope.reset = function () {
		console.log($scope.program);
		$scope.program = Programs.get(type);
		console.log($scope.program);
	}
});