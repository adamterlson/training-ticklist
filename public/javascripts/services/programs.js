tt.factory('program', function ($timeout, $q) {
	var DISTANCE_FROM_PROJECT_LEVEL = 5

	var generators = {
		linear: function (numberOfClimbs, projectLevel) {
			var startingIndex, 
				endingIndex, 
				slope, 
				climbs = [];

			endingIndex = projectLevel;
			startingIndex = endingIndex - DISTANCE_FROM_PROJECT_LEVEL;

			if (startingIndex < 0) {
				startingIndex = 0;
			}

			slope = (endingIndex - startingIndex) / numberOfClimbs;
			while (endingIndex > startingIndex) {
				climbs.push(Math.ceil(endingIndex));
				endingIndex = endingIndex - slope;
			}
			return climbs;
		}
	};

	var program = {
		type: 'linear',
		completedClimbs: [],
		climbs: [],
		finished: false,
		current: null,
		projectLevel: 3,
		numberOfClimbs: 10,

		// Rest Settings
		restTimer: true,
		restTime: 30,

		// Promises
		resting: null,
		climbing: null,

		generate: function () {
			program.climbs = generators[program.type](program.numberOfClimbs, program.projectLevel);
		},

		stage: function () {
			var dfd = $q.defer();
			
			program.current = program.next();

			dfd.resolve();

			return dfd.promise;
		},

		next: function () {
			return program.climbs.pop();
		},

		climb: function () {
			if (!program.climbs || !program.climbs.length) {
				program.generate();
			}

			program.climbing = $q.defer();

			return program.stage()
				.then(function () {
					return program.climbing.promise;
				})
				.then(program.log)
				.then(program._checkComplete)
				.then(program.rest)
				.then(program.climb);
		},

		log: function (climb) {
			program.completedClimbs.push(climb);
		},

		complete: function () {
			program.climbing.resolve(program.current);
		},

		rest: function (time) {
			program.resting = $q.defer();
			if (program.restTimer) {
				$timeout(program.resting.resolve, program.restTime * 1000);
			}
			else {
				program.resting.resolve();
			}

			program.resting.promise.then(function () {
				program.resting = null;
			});

			return program.resting.promise;
		},

		rested: function () {
			program.resting.resolve();
		},

		reset: function () {
			program.finished = false;
			program.completedClimbs = [];
			program.generate();
			program.stage();
			program.climb();
		},

		_checkComplete: function () {
			var dfd = $q.defer();
			if (program.completedClimbs.length >= program.numberOfClimbs) {
				program.finished = true;
				dfd.reject();
			}
			dfd.resolve();
			return dfd.promise;
		}
	};

	return program;
});