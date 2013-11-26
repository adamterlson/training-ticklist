tt.filter('sexypoints', function () {
	return function(points) {
		return Math.floor(points * 100);
	};
});