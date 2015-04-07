/* jshint maxstatements: false, maxlen: false */
/* global beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');

describe('lib/grime', function () {
    var dust, dustHelpers, fs, gaze, glob, grime, http, underscore;

    beforeEach(function () {

        dust = require('../mock/dustjs-linkedin');
        mockery.registerMock('dustjs-linkedin', dust);

        dustHelpers = require('../mock/dustjs-helpers');
        mockery.registerMock('dustjs-helpers', dustHelpers);

        fs = require('../mock/fs');
        mockery.registerMock('fs', fs);

        gaze = require('../mock/gaze');
        mockery.registerMock('gaze', gaze);

        glob = require('../mock/glob');
        mockery.registerMock('glob', glob);

        http = require('../mock/http');

        underscore = require('../mock/underscore');
        mockery.registerMock('underscore', underscore);

        grime = require('../../../lib/grime');

    });

    it('should be a function', function () {
        assert.isFunction(grime);
    });

    it('should have a `create` method', function () {
        assert.isFunction(grime.create);
    });

    it('should alias the `create` method', function () {
        assert.strictEqual(grime, grime.create);
    });

    describe('.create()', function () {
        var options, instance;

        beforeEach(function () {
            options = {
                filtersPath: 'test-views/filter',
                helpersPath: 'test-views/helper',
                templatesPath: 'test-views/template',
                sourceProperty: 'testViewData',
                templateExtension: 'dust',
                templateProperty: 'testTemplate',
                useBuiltInHelpers: false,
                debug: false
            };
            instance = grime.create(options);
        });

        it('should default the options', function () {
            assert.isTrue(underscore.defaults.calledOnce);
            assert.deepEqual(underscore.defaults.firstCall.args[0], {});
            assert.strictEqual(underscore.defaults.firstCall.args[1], options);
            assert.strictEqual(underscore.defaults.firstCall.args[2], grime.defaults);
        });

        it('should return an object', function () {
            assert.isObject(instance);
        });

        describe('returned object', function () {
            
            it('should have a `dust` property', function () {
                assert.isDefined(instance.dust);
            });

            describe('.dust', function () {

                it('should be set to the exports of the `dustjs-linkedin` module if `options.useBuiltInHelpers` is `false`', function () {
                    instance = grime.create({
                        useBuiltInHelpers: false
                    });
                    assert.strictEqual(instance.dust, dust);
                });

                it('should be set to the exports of the `dustjs-helpers` module if `options.useBuiltInHelpers` is `true`', function () {
                    instance = grime.create({
                        useBuiltInHelpers: true
                    });
                    assert.strictEqual(instance.dust, dustHelpers);
                });

            });

            it('should have a `loadFilter` method', function () {
                assert.isFunction(instance.loadFilter);
            });

            describe('.loadFilter()', function () {
                var fooFilter, barFilter;

                beforeEach(function () {
                    fooFilter = sinon.spy();
                    barFilter = {};
                    mockery.registerMock('test-views/filter/foo', fooFilter);
                    mockery.registerMock('test-views/filter/bar', barFilter);
                });

                it('should register the loaded filter with dust', function () {
                    instance.loadFilter('foo');
                    assert.strictEqual(instance.dust.filters.foo, fooFilter);
                });

                it('should return `true` if the filter was loaded and registered', function () {
                    assert.isTrue(instance.loadFilter('foo'));
                });

                it('should not register the filter if it does not export a function', function () {
                    instance.loadFilter('bar');
                    assert.notStrictEqual(instance.dust.filters.bar, barFilter);
                });

                it('should return `false` if the filter does not export a function', function () {
                    assert.isFalse(instance.loadFilter('bar'));
                });

                it('should not throw when the filter does not export a function', function () {
                    assert.doesNotThrow(function () {
                        instance.loadFilter('bar');
                    });
                });

                it('should return `false` if the filter does not exist', function () {
                    assert.isFalse(instance.loadFilter('baz'));
                });

                it('should not throw when the filter does not exist', function () {
                    assert.doesNotThrow(function () {
                        instance.loadFilter('baz');
                    });
                });

            });

            it('should have a `loadFilters` method', function () {
                assert.isFunction(instance.loadFilters);
            });

            describe('.loadFilters()', function () {

                beforeEach(function () {
                    glob.sync.withArgs('test-views/filter/**/*.js').returns([
                        'test-views/filter/foo.js',
                        'test-views/filter/bar.js',
                        'test-views/filter/baz/qux.js'
                    ]);
                    instance.loadFilter = sinon.spy();
                    instance.loadFilters();
                });

                it('should load all filter files', function () {
                    assert.isTrue(instance.loadFilter.withArgs('foo').calledOnce);
                    assert.isTrue(instance.loadFilter.withArgs('bar').calledOnce);
                    assert.isTrue(instance.loadFilter.withArgs('baz/qux').calledOnce);
                });

            });

            it('should have a `loadHelper` method', function () {
                assert.isFunction(instance.loadHelper);
            });

            describe('.loadHelper()', function () {
                var fooHelper, barHelper;

                beforeEach(function () {
                    fooHelper = sinon.spy();
                    barHelper = {};
                    mockery.registerMock('test-views/helper/foo', fooHelper);
                    mockery.registerMock('test-views/helper/bar', barHelper);
                });

                it('should register the loaded helper with dust', function () {
                    instance.loadHelper('foo');
                    assert.strictEqual(instance.dust.helpers.foo, fooHelper);
                });

                it('should return `true` if the helper was loaded and registered', function () {
                    assert.isTrue(instance.loadHelper('foo'));
                });

                it('should not register the helper if it does not export a function', function () {
                    instance.loadHelper('bar');
                    assert.notStrictEqual(instance.dust.helpers.bar, barHelper);
                });

                it('should return `false` if the helper does not export a function', function () {
                    assert.isFalse(instance.loadHelper('bar'));
                });

                it('should not throw when the helper does not export a function', function () {
                    assert.doesNotThrow(function () {
                        instance.loadHelper('bar');
                    });
                });

                it('should return `false` if the helper does not exist', function () {
                    assert.isFalse(instance.loadHelper('baz'));
                });

                it('should not throw when the helper does not exist', function () {
                    assert.doesNotThrow(function () {
                        instance.loadHelper('baz');
                    });
                });

            });

            it('should have a `loadHelpers` method', function () {
                assert.isFunction(instance.loadHelpers);
            });

            describe('.loadHelpers()', function () {

                beforeEach(function () {
                    glob.sync.withArgs('test-views/helper/**/*.js').returns([
                        'test-views/helper/foo.js',
                        'test-views/helper/bar.js',
                        'test-views/helper/baz/qux.js'
                    ]);
                    instance.loadHelper = sinon.spy();
                    instance.loadHelpers();
                });

                it('should load all helper files', function () {
                    assert.isTrue(instance.loadHelper.withArgs('foo').calledOnce);
                    assert.isTrue(instance.loadHelper.withArgs('bar').calledOnce);
                    assert.isTrue(instance.loadHelper.withArgs('baz/qux').calledOnce);
                });

            });

            it('should have a `loadTemplate` method', function () {
                assert.isFunction(instance.loadTemplate);
            });

            describe('.loadTemplate()', function () {
                var fooTemplate, fooTemplateCompiled, barTemplate, fooHtmlTemplate;

                beforeEach(function () {
                    fooTemplate = '<p>foo</p>';
                    fooTemplateCompiled = {src: fooTemplate};
                    barTemplate = '<p>{#bar}bar{/b}</p>';
                    fooHtmlTemplate = '<p>foo-html</p>';
                    fs.readFileSync.throws(new Error('...'));
                    fs.readFileSync.withArgs('test-views/template/foo.dust', 'utf-8').returns(fooTemplate);
                    fs.readFileSync.withArgs('test-views/template/bar.dust', 'utf-8').returns(barTemplate);
                    fs.readFileSync.withArgs('test-views/template/foo.html', 'utf-8').returns(fooHtmlTemplate);
                    instance.dust.compile.withArgs(fooTemplate, 'foo').returns(fooTemplateCompiled);
                    instance.dust.compile.withArgs(barTemplate, 'bar').throws(new Error('...'));
                });

                it('should load the expected template file', function () {
                    instance.loadTemplate('foo');
                    assert.isTrue(fs.readFileSync.calledOnce);
                    assert.strictEqual(fs.readFileSync.firstCall.returnValue, fooTemplate);
                });

                it('should use `options.templateExtension` to resolve the template path', function () {
                    instance = grime.create({
                        templatesPath: 'test-views/template',
                        templateExtension: 'html'
                    });
                    instance.loadTemplate('foo');
                    assert.isTrue(fs.readFileSync.calledOnce);
                    assert.strictEqual(fs.readFileSync.firstCall.returnValue, fooHtmlTemplate);
                });

                it('should compile the loaded template with dust', function () {
                    instance.loadTemplate('foo');
                    assert.isTrue(instance.dust.compile.withArgs(fooTemplate, 'foo').calledOnce);
                });

                it('should load the compiled templates into dust', function () {
                    instance.loadTemplate('foo');
                    assert.isTrue(instance.dust.loadSource.withArgs(fooTemplateCompiled).calledOnce);
                });

                it('should return `true` if the template was loaded and compiled', function () {
                    assert.isTrue(instance.loadTemplate('foo'));
                });

                it('should return `false` if the template does not compile', function () {
                    assert.isFalse(instance.loadTemplate('bar'));
                });

                it('should not throw when the template does not compile', function () {
                    assert.doesNotThrow(function () {
                        instance.loadTemplate('bar');
                    });
                });

                it('should not compile the template if it does not exist', function () {
                    instance.loadTemplate('baz');
                    assert.isFalse(instance.dust.compile.called);
                    assert.isFalse(instance.dust.loadSource.called);
                });

                it('should return `false` if the template does not exist', function () {
                    assert.isFalse(instance.loadTemplate('baz'));
                });

                it('should not throw when the template does not exist', function () {
                    assert.doesNotThrow(function () {
                        instance.loadTemplate('baz');
                    });
                });

            });

            it('should have a `loadTemplates` method', function () {
                assert.isFunction(instance.loadTemplates);
            });

            describe('.loadTemplates()', function () {

                beforeEach(function () {
                    glob.sync.withArgs('test-views/template/**/*.dust').returns([
                        'test-views/template/foo.dust',
                        'test-views/template/bar.dust',
                        'test-views/template/baz/qux.dust'
                    ]);
                    instance.loadTemplate = sinon.spy();
                    instance.loadTemplates();
                });

                it('should load all template files', function () {
                    assert.isTrue(instance.loadTemplate.withArgs('foo').calledOnce);
                    assert.isTrue(instance.loadTemplate.withArgs('bar').calledOnce);
                    assert.isTrue(instance.loadTemplate.withArgs('baz/qux').calledOnce);
                });

            });

            it('should have a `load` method', function () {
                assert.isFunction(instance.load);
            });

            describe('.load()', function () {

                beforeEach(function () {
                    instance.loadFilters = sinon.spy();
                    instance.loadHelpers = sinon.spy();
                    instance.loadTemplates = sinon.spy();
                    instance.load();
                });

                it('should load all helpers, filters, and templates', function () {
                    assert.isTrue(instance.loadFilters.calledOnce);
                    assert.isTrue(instance.loadHelpers.calledOnce);
                    assert.isTrue(instance.loadTemplates.calledOnce);
                });

            });

            it('should have an `isWatching` method', function () {
                assert.isFunction(instance.isWatching);
            });

            describe('.isWatching()', function () {

                it('should return `true` if the `watcher` property is truthy', function () {
                    instance.watcher = new gaze.Gaze();
                    assert.isTrue(instance.isWatching());
                });

                it('should return `false` if the `watcher` property is falsy', function () {
                    assert.isFalse(instance.isWatching());
                });

            });

            it('should have a `watch` method', function () {
                assert.isFunction(instance.watch);
            });

            describe('.watch()', function () {
                var watcher;

                beforeEach(function () {
                    instance.loadFilter = sinon.spy();
                    instance.loadHelper = sinon.spy();
                    instance.loadTemplate = sinon.spy();
                    instance.watch();
                    watcher = gaze.Gaze.firstCall.returnValue;
                });

                it('should create a new watcher and store it on the `watcher` property', function () {
                    assert.strictEqual(instance.watcher, watcher);
                });

                it('should pass the expected paths to the watcher', function () {
                    assert.deepEqual(gaze.Gaze.firstCall.args[0], [
                        'test-views/filter/**/*.js',
                        'test-views/helper/**/*.js',
                        'test-views/template/**/*.dust'
                    ]);
                });

                it('should handle the watcher "added" event', function () {
                    assert.isTrue(watcher.on.withArgs('added').calledOnce);
                    assert.isFunction(watcher.on.withArgs('added').firstCall.args[1]);
                });

                describe('watcher "added" handler', function () {
                    var addedHandler;

                    beforeEach(function () {
                        addedHandler = watcher.on.withArgs('added').firstCall.args[1];
                    });

                    it('should load filters when they are added', function () {
                        addedHandler('test-views/filter/foo/bar.js');
                        assert.isTrue(instance.loadFilter.withArgs('foo/bar').calledOnce);
                    });

                    it('should load helpers when they are added', function () {
                        addedHandler('test-views/helper/foo/bar.js');
                        assert.isTrue(instance.loadHelper.withArgs('foo/bar').calledOnce);
                    });

                    it('should load templates when they are added', function () {
                        addedHandler('test-views/template/foo/bar.js');
                        assert.isTrue(instance.loadTemplate.withArgs('foo/bar').calledOnce);
                    });

                });

                it('should handle the watcher "changed" event', function () {
                    assert.isTrue(watcher.on.withArgs('changed').calledOnce);
                    assert.isFunction(watcher.on.withArgs('changed').firstCall.args[1]);
                });

                describe('watcher "changed" handler', function () {
                    var changedHandler;

                    beforeEach(function () {
                        changedHandler = watcher.on.withArgs('changed').firstCall.args[1];
                    });

                    it('should load filters when they are changed', function () {
                        changedHandler('test-views/filter/foo/bar.js');
                        assert.isTrue(instance.loadFilter.withArgs('foo/bar').calledOnce);
                    });

                    it('should load helpers when they are changed', function () {
                        changedHandler('test-views/helper/foo/bar.js');
                        assert.isTrue(instance.loadHelper.withArgs('foo/bar').calledOnce);
                    });

                    it('should load templates when they are changed', function () {
                        changedHandler('test-views/template/foo/bar.js');
                        assert.isTrue(instance.loadTemplate.withArgs('foo/bar').calledOnce);
                    });

                });

                it('should handle the watcher "renamed" event', function () {
                    assert.isTrue(watcher.on.withArgs('renamed').calledOnce);
                    assert.isFunction(watcher.on.withArgs('renamed').firstCall.args[1]);
                });

                describe('watcher "renamed" handler', function () {
                    var renamedHandler;

                    beforeEach(function () {
                        renamedHandler = watcher.on.withArgs('renamed').firstCall.args[1];
                    });

                    it('should load filters when they are renamed', function () {
                        renamedHandler('test-views/filter/foo/bar.js');
                        assert.isTrue(instance.loadFilter.withArgs('foo/bar').calledOnce);
                    });

                    it('should load helpers when they are renamed', function () {
                        renamedHandler('test-views/helper/foo/bar.js');
                        assert.isTrue(instance.loadHelper.withArgs('foo/bar').calledOnce);
                    });

                    it('should load templates when they are renamed', function () {
                        renamedHandler('test-views/template/foo/bar.js');
                        assert.isTrue(instance.loadTemplate.withArgs('foo/bar').calledOnce);
                    });

                });

                it('should throw if the `watcher` property is already set', function () {
                    assert.throws(function () {
                        instance.watch();
                    }, 'Files are already being watched');
                });

            });

            it('should have a `unwatch` method', function () {
                assert.isFunction(instance.unwatch);
            });

            describe('.unwatch()', function () {
                var watcher;

                beforeEach(function () {
                    watcher = instance.watcher = new gaze.Gaze();
                    instance.unwatch();
                });

                it('should stop the watcher', function () {
                    assert.isTrue(watcher.close.calledOnce);
                });

                it('should delete the `watcher` property', function () {
                    assert.isUndefined(instance.watcher);
                });

                it('should throw if the `watcher` property is not set', function () {
                    assert.throws(function () {
                        instance.unwatch();
                    }, 'No files are being watched');
                });

            });

            it('should have a `render` method', function () {
                assert.isFunction(instance.render);
            });

            describe('.render()', function () {
                var callback, context;

                beforeEach(function () {
                    context = {
                        foo: 'bar'
                    };
                    callback = sinon.spy();
                });

                it('should render the expected template with dust', function () {
                    instance.render('foo', context, callback);
                    assert.isTrue(instance.dust.render.withArgs('foo', context, callback).calledOnce);
                });

            });

            it('should have a `middleware` method', function () {
                assert.isFunction(instance.middleware);
            });

            it('should have a `middleware.grime` property which references the instance', function () {
                assert.strictEqual(instance.middleware.grime, instance);
            });

            describe('.middleware()', function () {
                var request, response, next, renderingError, renderedTemplate;

                beforeEach(function () {
                    request = new http.ClientRequest();
                    response = new http.ServerResponse();
                    next = sinon.spy();
                    renderingError = new Error('...');
                    renderedTemplate = '<p>foo-html</p>';
                    instance.render = sinon.stub();
                    instance.render.yields(renderingError);
                    instance.render.withArgs('foo').yields(null, renderedTemplate);
                });

                describe('with a response that has view data', function () {

                    beforeEach(function () {
                        response.testViewData = {
                            testTemplate: 'foo',
                            bar: 'baz'
                        };
                        instance.middleware(request, response, next);
                    });

                    it('should render the expected template', function () {
                        assert.isTrue(instance.render.withArgs('foo', response.testViewData).calledOnce);
                    });

                    it('should end the response with the rendered output', function () {
                        assert.isTrue(response.end.withArgs(renderedTemplate).calledOnce);
                    });

                    it('should not call `next`', function () {
                        assert.isFalse(next.called);
                    });

                    it('should call next with an error if a rendering error occurs', function () {
                        response.testViewData.testTemplate = 'bar';
                        next.reset();
                        response.end.reset();
                        instance.middleware(request, response, next);
                        assert.isTrue(next.withArgs(renderingError).calledOnce);
                        assert.isFalse(response.end.called);
                    });

                });

                describe('with a response that does not have view data', function () {

                    beforeEach(function () {
                        instance.middleware(request, response, next);
                    });

                    it('should not render a template', function () {
                        assert.isFalse(instance.render.called);
                    });

                    it('should call `next` with no arguments', function () {
                        assert.isTrue(next.calledOnce);
                        assert.isUndefined(next.firstCall.args[0]);
                    });

                });

            });

        });

    });

    it('should have a `defaults` property', function () {
        assert.isObject(grime.defaults);
    });

    describe('.defaults', function () {
        var defaults;

        beforeEach(function () {
            defaults = grime.defaults;
        });

        it('should have a `filtersPath` property', function () {
            assert.strictEqual(defaults.filtersPath, './view/filter');
        });

        it('should have a `helpersPath` property', function () {
            assert.strictEqual(defaults.helpersPath, './view/helper');
        });

        it('should have a `templatesPath` property', function () {
            assert.strictEqual(defaults.templatesPath, './view/template');
        });

        it('should have a `sourceProperty` property', function () {
            assert.strictEqual(defaults.sourceProperty, 'viewData');
        });

        it('should have a `templateExtension` property', function () {
            assert.strictEqual(defaults.templateExtension, 'dust');
        });

        it('should have a `templateProperty` property', function () {
            assert.strictEqual(defaults.templateProperty, 'template');
        });

        it('should have a `useBuiltInHelpers` property', function () {
            assert.isTrue(defaults.useBuiltInHelpers);
        });

        it('should have a `debug` property', function () {
            assert.isFalse(defaults.debug);
        });

    });

    it('should have a `middleware` method', function () {
        assert.isFunction(grime.middleware);
    });

    describe('.middleware()', function () {
        var instance, middleware, options;

        beforeEach(function () {
            instance = {
                load: sinon.spy(),
                middleware: sinon.spy()
            };
            options = {
                foo: 'bar'
            };
            grime.create = sinon.stub().returns(instance);
            middleware = grime.middleware(options);
        });

        it('should create a grime instance with the passed in options', function () {
            assert.isTrue(grime.create.withArgs(options).calledOnce);
        });

        it('should call `load` on the created instance', function () {
            assert.isTrue(instance.load.calledOnce);
        });

        it('should return the middleware method of a created grime instance', function () {
            assert.strictEqual(middleware, instance.middleware);
        });

    });

});
