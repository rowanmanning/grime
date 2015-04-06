
Grime
=====

Manage loading and watching of [dust](http://www.dustjs.com/) templates, helpers, and filters.

**Current Version:** *0.0.0*  
**Node Support:** *0.10.x, 0.12.x*  
**License:** [MIT][mit]  
**Build Status:** [![Build Status][travis-img]][travis]

```js
var grime = require('grime');

var renderer = grime({
    templatesPath: './view/template',
    templateExtension: 'dust'
});

renderer.load();
renderer.watch();

renderer.render('example', {}, function (error, output) {
    console.log('Rendered output: ' + output);
});
```


Install
-------

Install Grime with [npm][npm]:

```sh
npm install grime
```


Getting Started
---------------

Require in Grime:

```js
var grime = require('grime');
```

Create a renderer, passing in [options](#options):

```js
var renderer = grime({
    templatesPath: './view/template',
    templateExtension: 'dust'
});
```

Load all of the templates, helpers, and filters (synchronously):

```js
renderer.load();
```

Watch the file system for changes to the templates, helpers, and filters. This will reload them when they are updated:

```js
renderer.watch();
```

Render a template by name, logging the output to the console:

```js
renderer.render('example', {}, function (error, output) {
    console.log('Rendered output: ' + output);
});
```


Usage
-----

TODO


Options
-------

TODO


Contributing
------------

To contribute to Grime, clone this repo locally and commit your code on a separate branch.

Please write unit tests for your code, and check that everything works by running the following before opening a pull-request:

```sh
make lint test
```


License
-------

Grime is licensed under the [MIT][mit] license.  
Copyright &copy; 2015, Rowan Manning



[mit]: LICENSE
[npm]: https://npmjs.org/
[travis]: https://travis-ci.org/rowanmanning/grime
[travis-img]: https://travis-ci.org/rowanmanning/grime.svg?branch=master
