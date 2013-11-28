tt.controller('ConfigureCtrl', function ConfigureCtrl($scope, ClimbingTypes) {
	$scope.types = _.map(ClimbingTypes, 'name');
	$scope.programs = ['guided', 'free', 'timed'];
});