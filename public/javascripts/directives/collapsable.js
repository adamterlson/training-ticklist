tt.directive('collapsable', function () {
	return {
		restrict: 'C',
		link: function ($scope, element, attrs) {
			var $collapsableContent = element.find('.collapsable-content');
			$collapsableContent.addClass('collapsed');

			element.find('.toggle').on('click', function () {
				$collapsableContent.toggleClass('collapsed');
			});
		}
	};
});


tt.directive('chart', ['$compile', function ($compile){
	return {
		restrict: 'E',
		scope: { 
			datapoints: '=datapoints', 
			sexypoints: '=sexypoints',
			special: '=special',
			lame: '=lame',
			special: '=special'
		},
		link: function($scope, element, attrs) {
			$scope.$watch('datapoints', function (newValue, oldValue) {
				$scope.bars = $scope.datapoints.map(function (tick) { 
					return _.extend(tick, {
						width: 500/$scope.datapoints.length - 2,
						height: tick.points*10
					});
				});
			}, true);

			var html = [];
			html.push('<div class="chart-container"><div class="chart">');
				html.push('<div class="bar" ng-class="{special: bar.special, lame: bar.lame}" ng-repeat="bar in bars track by $index" style="height: {{bar.height}}px; width: {{bar.width}}px"><span class="primary">{{bar.description}}</span><span class="secondary">{{bar.points | sexypoints}}</span></div>');
            html.push("</div></div>");
            element.html(html.join(''));
            $compile(element.contents())($scope);
		}
	}
}]);