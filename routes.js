/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Training Ticklist' });
};

/*
 * GET partials
 */

exports.partials = function(req, res){
	var filename = req.params.filename;
	res.render('partials/' + filename, { layout:false });
};
