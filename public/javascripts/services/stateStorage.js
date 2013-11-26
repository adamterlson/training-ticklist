tt.factory('StateStorage', function () {
	var STORAGE_ID = 'tt-storage';
	return {
		get: function () {
			return JSON.parse(localStorage.getItem(STORAGE_ID) || null);
		},

		put: function (state) {
			localStorage.setItem(STORAGE_ID, JSON.stringify(state));
		}
	};
});