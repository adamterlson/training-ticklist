tt.factory('Programs', function (ClimbingTypes, $timeout, $q) {
	var ProgramDefaults = {
		scale: ClimbingTypes[0].scale,
		restTimer: true,
		restTime: 30,
		totalClimbs: 4
	};

	var Program = function (options) {
		this.options = _.defaults(options || {}, ProgramDefaults);

		this.completedClimbs = [];

		this.generate();

		this.stage().then(this.climb.bind(this));
	};

	_.extend(Program.prototype, {
		climbing: null, // the dfd for the climbing
		current: null, // the current climb
		completedClimbs: null,
		finished: false, // the completion of the program

		generate: function () {
			this.climbs = this.options.scale.slice().reverse().map(function (label) {
				return {
					label: label,
					difficulty: this.options.scale.indexOf(label)
				};
			}.bind(this));
		},

		stage: function () {
			var dfd = $q.defer();
			
			this.current = this.next();
			
			if (this.completedClimbs.length >= this.options.totalClimbs) {
				this.finished = true;
				dfd.reject();
			}

			dfd.resolve();

			return dfd.promise;
		},

		next: function () {
			return this.climbs.pop();
		},

		climb: function () {
			this.climbing = $q.defer();
			this.climbing.promise
				.then(this.log.bind(this))
				.then(this.stage.bind(this))
				.then(this.rest.bind(this))
				.then(this.climb.bind(this));
		},

		log: function (climb) {
			this.completedClimbs.push(climb);
		},

		complete: function () {
			this.climbing.resolve(this.current);
		},

		rest: function (time) {
			this.resting = $q.defer();
			if (this.options.restTimer) {
				$timeout(this.resting.resolve, this.options.restTime * 1000);
			}
			else {
				this.resting.resolve();
			}

			this.resting.promise.then(function () {
				this.resting = null;
			}.bind(this));

			return this.resting.promise;
		},

		rested: function () {
			this.resting.resolve();
		}
	});

	return {
		get: function (options) {
			return new Program(options); //_.extend({}, base, types[type]);
		}
	}
});

