tt.controller('ConfigureCtrl', function ConfigureCtrl($scope, ClimbingTypes) {
	$scope.types = _.map(ClimbingTypes, 'name');
});