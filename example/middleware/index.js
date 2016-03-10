'use strict';

const connect = require('connect');
const grime = require('../..');

// Create a connect application
const app = connect();

// Add data to the response ready for Grime to pick up
// Normally you might get this from a database or something
app.use((request, response, next) => {
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
    filtersPath: `${__dirname}/../_shared/view/filter`,
    helpersPath: `${__dirname}/../_shared/view/helper`,
    templatesPath: `${__dirname}/view/template`
}));

// Listen on a port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Application running on port %s', port);
    console.log('Visit http://localhost:%s/ in your browser', port);
});
