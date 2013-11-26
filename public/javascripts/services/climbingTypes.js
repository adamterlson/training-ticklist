tt.service('ClimbingTypes', function () {
	var vScale = ['VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'];
	var yosemiteScale = ['5.6', '5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d', '5.12a', '5.12b', '5.12c', '5.12d'];
	var climbingTypes = [
		{ name: 'top rope', scale: yosemiteScale },
		{ name: 'sport', scale: yosemiteScale },
		{ name: 'boulder', scale: vScale }
	];

	return climbingTypes;
});