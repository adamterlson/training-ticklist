tt.controller('SetupCtrl', function SetupCtrl($scope, ClimbingTypes) {
	$scope.types = _.map(ClimbingTypes, 'name');
});