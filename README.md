
Grime
=====

Manage loading and watching of [dust][dust] templates, helpers, and filters.

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

You'll also need to install [dust][dust] and [dust-helpers][dust-helpers] for Grime to run:

```sh
npm install dustjs-linkedin
npm install dustjs-helpers
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

Create a renderer with the passed in [`options`](#options) object:

```js
var renderer = grime({ /* ... */ });
```


### Loading

#### `renderer.load()`

Load all of the templates, helpers, and filters found in the renderer's configured directories. This is a synchronous operation, so should only be used in setup.

#### `renderer.loadTemplates()`

Load all of the templates found in the renderer's configured [template directory](#templatespath-string). This is a synchronous operation, so should only be used in setup.

#### `renderer.loadHelpers()`

Load all of the helpers found in the renderer's configured [helper directory](#helperspath-string). This is a synchronous operation, so should only be used in setup.

#### `renderer.loadFilters()`

Load all of the filters found in the renderer's configured [filter directory](#filterspath-string). This is a synchronous operation, so should only be used in setup.

#### `renderer.loadTemplate(name)`

Load a template by name. This is a synchronous operation, so should only be used in setup. Returns `true` if the load was successful.

```js
name = String
return Boolean
```

#### `renderer.loadHelper(name)`

Load a helper by name. This is a synchronous operation, so should only be used in setup. Returns `true` if the load was successful.

```js
name = String
return Boolean
```

#### `renderer.loadFilter(name)`

Load a filter by name. This is a synchronous operation, so should only be used in setup. Returns `true` if the load was successful.

```js
name = String
return Boolean
```


### Rendering

#### `renderer.render(name, context, callback)`

Render a template by name, passing in a context object. The callback receives an error object if rendering failed, and an output string if it is successful.

```js
name     = String
context  = String
callback = Function (error, output)
             error  = Error || null
             output = String
return     Boolean
```


### Watching

#### `renderer.watch()`

Start watching the configured directories for changes to template, helper, and filter files. If one of these files changes, reload it.

#### `renderer.unwatch()`

Stop watching the directories. Should be called *after* `renderer.watch()`.

#### `renderer.isWatching()`

Get whether the renderer is watching directories for changes.

```js
return Boolean
```


### Middleware

#### `renderer.middleware(request, response, next)`

Handle a [connect][connect]-style request/response. This will look in `response.viewData` ([configurable](#responsedataproperty-string)) for an object which it will use as the context of a `renderer.render()` call. It will take the template to be rendered from `response.viewData.template` ([configurable](#templateproperty-string)).

Example:

```js
var app = connect();
app.use(renderer.middleware);
```

#### `grime.middleware(options)`

Shortcut to create a renderer and immediately return its `middleware` method. The passed in options will be passed to the `grime` constructor.

Example:

```js
var app = connect();
app.use(grime.middleware({ /* ... */ }));
```


Options
-------

#### `filtersPath` (string)

The directory to look for filter files in. Defaults to `'./view/filter'`.

#### `helpersPath` (string)

The directory to look for helper files in. Defaults to `'./view/helper'`.

#### `templatesPath` (string)

The directory to look for template files in. Defaults to `'./view/template'`.

#### `responseDataProperty` (string)

The property on `response` where view data is stored, used in middleware only. Defaults to `'viewData'`.

#### `templateExtension` (string)

The extension template files should have. Files that do not have this extension will not be loaded. Defaults to `'dust'`.

#### `templateProperty` (string)

The property on `response.viewData` where the template name is stored, used in middleware only. Defaults to `'template'`.

#### `useBuiltInHelpers` (boolean)

Whether to load the built-in dust helpers found in `dustjs-helpers`. Defaults to `true`.

#### `debug` (boolean)

Whether to log debug messages. Defaults to `false`.


Examples
--------

### Basic Example

Load a template, a helper, and a filter, then render the template. Output the rendered template to the console.

```
node example/basic
```

### Middleware Example

Add a renderer to a [connect][connect] middleware stack and render/output templates based on response data.

```
node example/middleware
```


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



[connect]: https://github.com/senchalabs/connect
[dust]: https://github.com/linkedin/dustjs
[dust-helpers]: https://github.com/linkedin/dustjs-helpers
[mit]: LICENSE
[npm]: https://npmjs.org/
[travis]: https://travis-ci.org/rowanmanning/grime
[travis-img]: https://travis-ci.org/rowanmanning/grime.svg?branch=master
