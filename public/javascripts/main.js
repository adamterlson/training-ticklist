var SCALE_LENGTH = 7,
	BONUS_CLIMBS = 2,
	MAX_POINTS = 10;

var tt = angular.module('tt', ['ngResource']);

$(document).ready(function () {
	$('.open-config').click(function (e) {
		$('.config-menu .dropdown-menu').dropdown('toggle');
		return false;
	});
})