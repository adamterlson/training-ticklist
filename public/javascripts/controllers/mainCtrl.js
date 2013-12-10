tt.controller('MainCtrl', function MainCtrl($scope, StateStorage, ClimbingTypes, $state) {
	var state = $scope.state = _.defaults(StateStorage.get() || {}, {
		climbingType: ClimbingTypes[0].name,
		projectLevel: 0,
		goal: 50,
		ticks: [],
		program: 'free'
	});

	$scope.programs = ['guided', 'free', 'timed'];

	$scope.$watch('state', function (newValue, oldValue) {
		if (newValue.climbingType !== oldValue.climbingType) {
			newValue.projectLevel = $scope.fullScale()[0];
		}
		StateStorage.put(newValue)
	}, true);

	$scope.fullScale = function () {
		return _.find(ClimbingTypes, { name: state.climbingType }).scale;
	}

	$scope.toggleConfig = function (e) {
		e.stopPropagation();
		var $body = angular.element('body');
		$body.toggleClass('js-nav');
		if ($body.hasClass('js-nav')) {
			angular.element(document.getElementById('config-menu')).off().on(Modernizr.touch ? 'touchstart' : 'click', function (e) {
				e.stopPropagation();
			});
			$body.one(Modernizr.touch ? 'touchstart' : 'click', function () {
				$scope.toggleConfig(e);
			});
		}
	}

	$scope.score = { 
		is: {
			lame: function (level) {
				return level < state.projectLevel - 3;
			},
			special: function (level) {
				//console.log('special ' + level + ' ' + state.projectLevel + (level >= state.projectLevel));
				return level >= state.projectLevel;
			}
		}
	};

	$scope.special = function (tick) {
		return tick
	}
});