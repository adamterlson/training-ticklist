tt.directive('timer', function ($timeout) {
	var timer; 

	return {
		restrict: 'E',
		scope: {
			seconds: '@'
		},
		template: '{{seconds | timer}}',
		link: function ($scope, element, attrs) {
			var tick = function () {
				$scope.seconds -= 1;
				if ($scope.seconds > 0) {
					$timeout(tick, 1000);
				}
			};
			$timeout(tick, 1000);
		}
	};
});