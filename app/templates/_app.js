'use strict';

// Module dependencies
var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path');

var app = express();

// All environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.urlencoded());
app.use(express.json());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

// Local variables
app.locals.staticPath = '';

// Enable this if app is going to be deployed behind a cache server like Varnish
app.enable('trust proxy');

// Routes
app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
