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
			sexypoints: '=sexypoints'
		},
		link: function($scope, element, attrs) {
			$scope.$watch('datapoints', function (newValue, oldValue) {
				$scope.bars = $scope.datapoints.map(function (tick) { 
					return {
						width: 500/$scope.datapoints.length - 2,
						height: tick.points*10, // hard code point for ticks
						primaryLabel: tick.description,
						secondaryLabel: tick.points
					};
				});
			}, true);

			var html = [];
			html.push('<div class="chart-container"><div class="chart">');
				html.push('<div class="bar" ng-repeat="bar in bars" style="height: {{bar.height}}px; width: {{bar.width}}px"><span class="primary">{{bar.primaryLabel}}</span><span class="secondary">{{bar.secondaryLabel | sexypoints}}</span></div>')
            html.push("</div></div>")
            element.html(html.join(''));
            $compile(element.contents())($scope);
		}
	}
}]);