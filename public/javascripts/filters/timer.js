tt.filter('timer', function () {
	return function(totalSec) {
		var hours = parseInt(totalSec / 3600) % 24;
		var minutes = parseInt(totalSec / 60) % 60;
		var seconds = totalSec % 60;
		//(hours < 10 ? "0" + hours : hours) + ":" + 
		return (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
	};
});