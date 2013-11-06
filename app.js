
/**
 * Module dependencies.
 */

var express = require('express'), 
	partials = require('express-partials');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var ExpressREST = require('./lib/express-rest'),
    data = [],

    myCollection = new ExpressREST.Collection(data),
    myProvider = new ExpressREST.Provider({ collection: myCollection }),
    myController = new ExpressREST.Controller({ provider: myProvider });

myController.bind(app, '/api/ticks');

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
