tt.factory('Programs', function (ClimbingTypes, $timeout, $q) {
	var climbs = [
		{
			difficultyRating: 0,
			label: 'VB'
		},
		{
			difficultyRating: 1,
			label: 'V1'
		}
	];

	var ProgramDefaults = {
		scale: ClimbingTypes[0].scale,
		restTimer: true,
		restTime: 30,
		totalClimbs: 4
	};

	var Program = function (options) {
		this.options = _.defaults(options || {}, ProgramDefaults);

		this.completedClimbs = [];

		this.stage().then(this.climb.bind(this));
	};

	_.extend(Program.prototype, {
		climbing: null, // the dfd for the climbing
		current: null, // the current climb
		completedClimbs: null,
		finished: false, // the completion of the program

		stage: function () {
			var dfd = $q.defer();

			if (!this.current) {
				this.current = this.options.scale[0];
			}
			else {
				this.current = this.options.scale[this.options.scale.indexOf(this.current) + 1];
			}
			if (!this.current || this.completedClimbs.length >= this.options.totalClimbs) {
				this.finished = true;
				dfd.reject();
			}

			dfd.resolve();

			return dfd.promise;
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
			this.completedClimbs.push({
				label: climb
			});
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


	var base = {
		complete: [],
		progressIndex: 0,
		resting: false,
		sended: function () {
			this.complete.push(this.climbs[this.progressIndex++]);
			this.resting = true;
			var that = this;
			$timeout(function () {
				that.resting = false;
			}, this.restTime * 1000);
		},
		tooTired: function () {
			this.sended();
		},
		tooHard: function () {
			this.sended();
		},
		reset: function () {
			this.resting = false;
			this.complete.length = 0;
			this.progressIndex = 0;
		},
		ready: function () {
			this.resting = false;
		}
	};
	var types = {
		linear: {
			climbs: ['V1', 'V2', 'V3'],
			restTime: 30
		}
	};
	return {
		get: function (options) {
			return new Program(options); //_.extend({}, base, types[type]);
		}
	}
});

