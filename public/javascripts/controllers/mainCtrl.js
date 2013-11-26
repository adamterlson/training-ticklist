tt.controller('MainCtrl', function MainCtrl($scope, SessionStorage, ClimbingTypes) {
	var state = SessionStorage.get();

	if (!state) {
		state = {
			climbingType: ClimbingTypes[0].name,
			projectLevel: ClimbingTypes[0].scale[0],
			goal: 50,
			ticks: []
		};
	}

	$scope.showConfigMenu = function () {
		$('.config-menu .dropdown').addClass('open');
		alert(1);
	}

	$scope.session = state;
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