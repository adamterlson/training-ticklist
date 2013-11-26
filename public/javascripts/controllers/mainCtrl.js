tt.controller('MainCtrl', function MainCtrl($scope, StateStorage, ClimbingTypes) {
	var state = $scope.state = _.defaults(StateStorage.get() || {}, {
		climbingType: ClimbingTypes[0].name,
		projectLevel: ClimbingTypes[0].scale[0],
		goal: 50,
		ticks: [],
		mode: 'free'
	});

	$scope.$watch('state', function (newValue, oldValue) {
		if (newValue.climbingType !== oldValue.climbingType) {
			newValue.projectLevel = $scope.fullScale()[0];
		}
		StateStorage.put(newValue)
	}, true);

	$scope.fullScale = function () {
		return _.find(ClimbingTypes, { name: state.climbingType }).scale;
	}
});