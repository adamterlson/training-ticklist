var SCALE_LENGTH = 7,
	BONUS_CLIMBS = 2,
	MAX_POINTS = 10;

var tt = angular.module('tt', ['ui.router', 'ui.bootstrap'])
	.config(function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise("/404");
		$stateProvider
			.state('root', {
				url: '',
				templateUrl: 'partials/free',
				controller: 'FreeModeCtrl'
			})
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