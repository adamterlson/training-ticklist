var SCALE_LENGTH = 8,
	BONUS_CLIMBS = 2,
	MAX_POINTS = 10;

//document.ontouchmove = function(e) { e.preventDefault(); };

var tt = angular.module('tt', ['ui.router', 'ui.bootstrap', 'ngTouch'])
	.config(function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise("/guided");
		$stateProvider
			.state('free', {
				url: '/free',
				templateUrl: 'partials/free',
				controller: 'FreeModeCtrl'
			})
			.state('guided', {
				url: '/guided',
				templateUrl: 'partials/guided',
				controller: 'GuidedModeCtrl'
			});
	});

	