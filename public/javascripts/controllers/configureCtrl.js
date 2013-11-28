tt.controller('ConfigureCtrl', function ConfigureCtrl($scope, ClimbingTypes) {
	$scope.types = _.map(ClimbingTypes, 'name');
	$scope.programs = ['guided', 'free', 'timed'];
});

$(document).ready(function () {
	$('.open-config').click(function (e) {
		$('.config-menu .dropdown-menu').dropdown('toggle');
		return false;
	});
})