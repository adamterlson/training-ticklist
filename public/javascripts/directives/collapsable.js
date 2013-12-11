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
						width: 100/$scope.datapoints.length

					});
				});
			}, true);

			var html = [];
			html.push('<div class="chart-container"><div class="chart">');
				html.push('<div class="point" ng-repeat="bar in bars track by $index" style="width: {{bar.width}}%">');
					html.push('<div class="bar" ng-class="{special: bar.special, lame: bar.lame}" style="height: {{bar.points*10}}px;"><span class="primary">{{bar.description}}</span><span class="secondary">{{bar.points | sexypoints}}</span></div>');
				html.push('</div>');
            html.push("</div></div>");
            element.html(html.join(''));
            $compile(element.contents())($scope);
		}
	}
}]);