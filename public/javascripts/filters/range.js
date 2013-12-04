tt.filter('range', function() {
  return function(input, total, step) {
    for (var i=0; i<total; i+=step || 1)
      input.push(i);
    return input;
  };
});