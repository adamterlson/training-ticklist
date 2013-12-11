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
			chart: '=chart',
		},
		link: function($scope, element, attrs) {
			var html = [];
			html.push('<div class="chart-container"><div class="chart">');
				html.push('<div class="point" ng-repeat="point in chart.datapoints track by $index" style="width: {{100/chart.datapoints.length}}%">');
					html.push('<div class="bar {{chart.styler(point)}}" style="height: {{point.points*10}}px;"><span class="primary">{{point.description}}</span><span class="secondary">{{chart.formatter(point)}}</span></div>');
				html.push('</div>');
            html.push("</div></div>");
            element.html(html.join(''));
            $compile(element.contents())($scope);
		}
	}
}]);