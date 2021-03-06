tt.factory('programs', function () {
	return [
		{
			name: 'linear',
			description: 'A linear build to work on your project level.'
		},
		{
			name: 'technique',
			description: 'Nothing but easy problems.  Take your time and focus on technique!'
		}
	];
});

tt.factory('program', function ($timeout, $q) {
	var DISTANCE_FROM_PROJECT_LEVEL = 5

	var generators = {
		linear: function (numberOfClimbs, projectLevel) {
			var endingIndex = projectLevel, 
				startingIndex = endingIndex - DISTANCE_FROM_PROJECT_LEVEL, 
				slope, 
				climbs = [];

			if (startingIndex < 0) {
				startingIndex = 0;
			}
			if (endingIndex < 2) {
				endingIndex = 2;
			}

			slope = (endingIndex - startingIndex) / numberOfClimbs;
			while(climbs.length <= numberOfClimbs) {
				climbs.push(Math.round(endingIndex));
				endingIndex = endingIndex - slope;
			}
			return climbs;
		},
		technique: function (numberOfClimbs, projectLevel) {
			var endingIndex = projectLevel, 
				startingIndex = endingIndex - DISTANCE_FROM_PROJECT_LEVEL, 
				slope, 
				climbs = [];

			while(climbs.length <= numberOfClimbs) {
				climbs.push(startingIndex + 1);
				climbs.push(startingIndex);
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

		// Modifiers
		modifiers: {
			timer: 0,
			difficulty: 0
		},

		// Promises
		resting: null,
		climbing: null,

		generate: function () {
			program.climbs = generators[program.type](program.numberOfClimbs, program.projectLevel);
		},

		stage: function () {
			var dfd = $q.defer();
			
			program.current = program.next() - program.modifiers.difficulty;

			if (program.current < 0) program.current = 0;

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
				$timeout(program.resting.resolve, program.totalRestTime() * 1000);
			}
			else {
				program.resting.resolve();
			}

			program.resting.promise.then(function () {
				program.resting = null;
			});

			return program.resting.promise;
		},

		totalRestTime: function () {
			return program.restTime + program.modifiers.timer * 30
		},

		rested: function () {
			//Add a flag that lasts for a few seconds so if the timer is skipped
			//it'll decrement the rest time modifier

			//if (program.tooTired > 0) program.tooTired--;

			program.resting.resolve();
		},

		reset: function () {
			program.finished = false;
			program.completedClimbs = [];
			program.generate();
			program.stage();
			program.climb();
		},

		tooTired: function () {
			program.modifiers.timer++;
			program.rest();
		},

		tooHard: function () {
			program.modifiers.difficulty++;
			program.climbs.push(program.current);
			program.stage();
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