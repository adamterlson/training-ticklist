tt.controller('GuidedModeCtrl', function GuidedModeCtrl($scope, ClimbingTypes, Programs) {
	var state = $scope.state;

	state.program = 'guided';

	var type = 'linear';

	var options = {
		type: type
	};

	$scope.program = Programs.get(options);

	$scope.reset = function () {
		$scope.program = Programs.get(options);
	}
});