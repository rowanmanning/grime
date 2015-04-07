'use strict';

var grime = require('../..');

// Create a renderer
var renderer = grime({
    filtersPath: __dirname + '/view/filter',
    helpersPath: __dirname + '/view/helper',
    templatesPath: __dirname + '/view/template'
});

// Load all templates, helpers, and filters
renderer.load();

// Render the example template and log the output
renderer.render('example', {foo: 'bar'}, function (error, output) {
    console.log(output);
});
