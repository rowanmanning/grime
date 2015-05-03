'use strict';

var _ = require('underscore');
var chokidar = require('chokidar');
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var tryRequire = require('./try-require');

module.exports = grime;
module.exports.create = grime;
module.exports.middleware = grimeMiddleware;

module.exports.defaults = {
    filtersPath: './view/filter',
    helpersPath: './view/helper',
    templatesPath: './view/template',
    log: {
        error: function () {},
        info: function () {}
    },
    sourceProperty: 'viewData',
    templateExtension: 'dust',
    templateProperty: 'template',
    useBuiltInHelpers: true
};

function grime (options) {
    options = defaultOptions(options);
    var self = {
        dust: require(options.useBuiltInHelpers ? 'dustjs-helpers' : 'dustjs-linkedin'),

        loadFilter: function (name) {
            var filterPath = path.join(options.filtersPath, name);
            var filter = tryRequire(filterPath, true);
            if (filter === undefined) {
                options.log.error('Filter "' + name + '" does not exist');
                return false;
            }
            if (typeof filter !== 'function') {
                options.log.error('Filter "' + name + '" does not export a function');
                return false;
            }
            options.log.info('Filter loaded: "' + name + '"');
            self.dust.filters[name] = filter;
            return true;
        },

        loadFilters: function () {
            var pattern = path.join(options.filtersPath, '**', '*.js');
            glob.sync(pattern)
                .map(relativePath.bind(null, options.filtersPath))
                .forEach(self.loadFilter);
        },

        loadHelper: function (name) {
            var helperPath = path.join(options.helpersPath, name);
            var helper = tryRequire(helperPath, true);
            if (helper === undefined) {
                options.log.error('Helper "' + name + '" does not exist');
                return false;
            }
            if (typeof helper !== 'function') {
                options.log.error('Helper "' + name + '" does not export a function');
                return false;
            }
            options.log.info('Helper loaded: "' + name + '"');
            self.dust.helpers[name] = helper;
            return true;
        },

        loadHelpers: function () {
            var pattern = path.join(options.helpersPath, '**', '*.js');
            glob.sync(pattern)
                .map(relativePath.bind(null, options.helpersPath))
                .forEach(self.loadHelper);
        },

        loadTemplate: function (name) {
            var templateFileName = name + '.' + options.templateExtension;
            var templatePath = path.join(options.templatesPath, templateFileName);
            var templateString = null;
            var template = null;
            try {
                templateString = fs.readFileSync(templatePath, 'utf-8');
            } catch (error) {
                options.log.error('Template "' + name + '" does not exist');
                return false;
            }
            try {
                template = self.dust.compile(templateString, name);
                self.dust.loadSource(template);
            } catch (error) {
                options.log.error('Template "' + name + '" does not compile: ' + error.message);
                return false;
            }
            options.log.info('Template loaded: "' + name + '"');
            return true;
        },

        loadTemplates: function () {
            var pattern = path.join(options.templatesPath, '**', '*.' + options.templateExtension);
            glob.sync(pattern)
                .map(relativePath.bind(null, options.templatesPath))
                .forEach(self.loadTemplate);
        },

        load: function () {
            self.loadFilters();
            self.loadHelpers();
            self.loadTemplates();
        },

        isWatching: function () {
            return !!self.watcher;
        },

        watch: function () {
            if (self.watcher) {
                throw new Error('Files are already being watched');
            }
            self.watcher = chokidar.watch([
                path.join(options.filtersPath, '/**/*.js'),
                path.join(options.helpersPath, '/**/*.js'),
                path.join(options.templatesPath, '/**/*.' + options.templateExtension)
            ]);
            self.watcher.on('add', self._loadByFileType);
            self.watcher.on('change', self._loadByFileType);
        },

        unwatch: function () {
            if (!self.watcher) {
                throw new Error('No files are being watched');
            }
            self.watcher.close();
            delete self.watcher;
        },

        render: function (name, context, done) {
            self.dust.render(name, context, done);
        },

        middleware: function (request, response, next) {
            var viewData = response[options.sourceProperty];
            if (viewData) {
                var templateName = viewData[options.templateProperty];
                return self.render(templateName, viewData, function (err, output) {
                    if (err) {
                        return next(err);
                    }
                    response.end(output);
                });
            }
            next();
        },

        _loadByFileType: function (filePath) {
            var fileType = self._resolveFileType(filePath);
            var name = relativePath(options[fileType + 'sPath'], filePath);
            return self['load' + upperCaseFirst(fileType)](name);
        },

        _resolveFileType: function (filePath) {
            if (filePath.indexOf(options.templatesPathResolved) === 0) {
                return 'template';
            }
            if (filePath.indexOf(options.helpersPathResolved) === 0) {
                return 'helper';
            }
            if (filePath.indexOf(options.filtersPathResolved) === 0) {
                return 'filter';
            }
            return 'template';
        }

    };
    self.middleware.grime = self;
    return self;
}

function grimeMiddleware (options) {
    var renderer = module.exports.create(options);
    if (process.env.NODE_ENV === 'production') {
        renderer.load();
    } else {
        renderer.watch();
    }
    return renderer.middleware;
}

function defaultOptions (options) {
    options = _.defaults({}, options, grime.defaults);
    options.filtersPathResolved = path.resolve(options.filtersPath);
    options.helpersPathResolved = path.resolve(options.helpersPath);
    options.templatesPathResolved = path.resolve(options.templatesPath);
    return options;
}

function relativePath (basePath, filePath) {
    return path.relative(basePath, removePathExtension(filePath));
}

function removePathExtension (filePath) {
    return filePath.substr(0, filePath.lastIndexOf('.'));
}

function upperCaseFirst (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
