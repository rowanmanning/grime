'use strict';

const grime = require('../..');

// Create a renderer
const renderer = grime({
    filtersPath: `${__dirname}/../_shared/view/filter`,
    helpersPath: `${__dirname}/../_shared/view/helper`,
    templatesPath: `${__dirname}/view/template`
});

// Load all templates, helpers, and filters
renderer.load();

// Render the example template and log the output
renderer.render('example', {foo: 'bar'}, (error, output) => {
    console.log(output);
});
