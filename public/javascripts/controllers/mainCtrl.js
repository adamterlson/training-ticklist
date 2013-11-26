tt.controller('MainCtrl', function MainCtrl($scope, SessionStorage, ClimbingTypes) {
	var state = $scope.session = _.defaults(SessionStorage.get() || {}, {
		climbingType: ClimbingTypes[0].name,
		projectLevel: ClimbingTypes[0].scale[0],
		goal: 50,
		ticks: [],
		mode: 'free'
	});

	$scope.$watch('session', function (newValue, oldValue) {
		if (newValue.climbingType !== oldValue.climbingType) {
			newValue.projectLevel = $scope.fullScale()[0];
		}
		SessionStorage.put(newValue)
	}, true);

	$scope.fullScale = function () {
		return _.find(ClimbingTypes, { name: state.climbingType }).scale;
	}
});