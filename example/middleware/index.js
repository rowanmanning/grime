'use strict';

var connect = require('connect');
var grime = require('../..');

// Create a connect application
var app = connect();

// Add data to the response ready for Grime to pick up
// Normally you might get this from a database or something
app.use(function (request, response, next) {
    response.connectViewData = {
        template: 'example',
        foo: 'bar'
    };
    next();
});

// Set up the Grime middleware
app.use(grime.middleware({
    sourceProperty: 'connectViewData',
    templateProperty: 'template',
    filtersPath: __dirname + '/../_shared/view/filter',
    helpersPath: __dirname + '/../_shared/view/helper',
    templatesPath: __dirname + '/view/template',
    debug: true
}));

// Listen on a port
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Application running on port %s', port);
    console.log('Visit http://localhost:%s/ in your browser', port);
});
