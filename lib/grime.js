'use strict';

var _ = require('underscore');
var fs = require('fs');
var Gaze = require('gaze').Gaze;
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
    responseDataProperty: 'viewData',
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
            var filter = tryRequire(filterPath);
            if (typeof filter !== 'function') {
                return false;
            }
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
            var helper = tryRequire(helperPath);
            if (typeof helper !== 'function') {
                return false;
            }
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
            try {
                var templateFileName = name + '.' + options.templateExtension;
                var templatePath = path.join(options.templatesPath, templateFileName);
                var templateString = fs.readFileSync(templatePath, 'utf-8');
                var template = self.dust.compile(templateString, name);
                self.dust.loadSource(template);
            } catch (error) {
                return false;
            }
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
            self.watcher = new Gaze([
                path.join(options.filtersPath, '/**/*.js'),
                path.join(options.helpersPath, '/**/*.js'),
                path.join(options.templatesPath, '/**/*.' + options.templateExtension)
            ]);
            self.watcher.on('added', self._loadByFileType);
            self.watcher.on('changed', self._loadByFileType);
            self.watcher.on('renamed', self._loadByFileType);
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
            var viewData = response[options.responseDataProperty];
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
            if (filePath.indexOf(options.templatesPath) === 0) {
                return 'template';
            }
            if (filePath.indexOf(options.helpersPath) === 0) {
                return 'helper';
            }
            if (filePath.indexOf(options.filtersPath) === 0) {
                return 'filter';
            }
        }

    };
    self.middleware.grime = self;
    return self;
}

function grimeMiddleware (options) {
    return module.exports.create(options).middleware;
}

function defaultOptions (options) {
    return _.defaults({}, options, grime.defaults);
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
