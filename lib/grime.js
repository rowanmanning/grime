'use strict';

const _ = require('underscore');
const chokidar = require('chokidar');
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const tryRequire = require('./try-require');

module.exports = grime;
module.exports.create = grime;
module.exports.middleware = grimeMiddleware;

module.exports.defaults = {
    filtersPath: './view/filter',
    helpersPath: './view/helper',
    templatesPath: './view/template',
    log: {
        error: /* istanbul ignore next */ () => {},
        info: /* istanbul ignore next */ () => {}
    },
    sourceProperty: 'viewData',
    templateExtension: 'dust',
    templateProperty: 'template',
    useBuiltInHelpers: true
};

function grime (options) {
    options = defaultOptions(options);
    const self = {
        dust: require(options.useBuiltInHelpers ? 'dustjs-helpers' : 'dustjs-linkedin'),

        loadFilter (name) {
            const filterPath = path.join(options.filtersPath, name);
            const filter = tryRequire(filterPath, true);
            if (filter === undefined) {
                options.log.error(`Filter "${name}" does not exist`);
                return false;
            }
            if (typeof filter !== 'function') {
                options.log.error(`Filter "${name}" does not export a function`);
                return false;
            }
            options.log.info(`Filter loaded: "${name}"`);
            self.dust.filters[name] = filter;
            return true;
        },

        loadFilters () {
            const pattern = path.join(options.filtersPath, '**', '*.js');
            glob.sync(pattern)
                .map(relativePath.bind(null, options.filtersPath))
                .forEach(self.loadFilter);
        },

        loadHelper (name) {
            const helperPath = path.join(options.helpersPath, name);
            const helper = tryRequire(helperPath, true);
            if (helper === undefined) {
                options.log.error(`Helper "${name}" does not exist`);
                return false;
            }
            if (typeof helper !== 'function') {
                options.log.error(`Helper "${name}" does not export a function`);
                return false;
            }
            options.log.info(`Helper loaded: "${name}"`);
            self.dust.helpers[name] = helper;
            return true;
        },

        loadHelpers () {
            const pattern = path.join(options.helpersPath, '**', '*.js');
            glob.sync(pattern)
                .map(relativePath.bind(null, options.helpersPath))
                .forEach(self.loadHelper);
        },

        loadTemplate (name) {
            const templateFileName = `${name}.${options.templateExtension}`;
            const templatePath = path.join(options.templatesPath, templateFileName);
            let templateString = null;
            let template = null;
            try {
                templateString = fs.readFileSync(templatePath, 'utf-8');
            } catch (error) {
                options.log.error(`Template "${name}" does not exist`);
                return false;
            }
            try {
                template = self.dust.compile(templateString, name);
                self.dust.loadSource(template);
            } catch (error) {
                options.log.error(`Template "${name}" does not compile: ${error.message}`);
                return false;
            }
            options.log.info(`Template loaded: "${name}"`);
            return true;
        },

        loadTemplates () {
            const templateExtension = options.templateExtension;
            const pattern = path.join(options.templatesPath, '**', `*.${templateExtension}`);
            glob.sync(pattern)
                .map(relativePath.bind(null, options.templatesPath))
                .forEach(self.loadTemplate);
        },

        load () {
            self.loadFilters();
            self.loadHelpers();
            self.loadTemplates();
        },

        isWatching () {
            return Boolean(self.watcher);
        },

        watch () {
            if (self.watcher) {
                throw new Error('Files are already being watched');
            }
            self.watcher = chokidar.watch([
                path.join(options.filtersPath, '/**/*.js'),
                path.join(options.helpersPath, '/**/*.js'),
                path.join(options.templatesPath, `/**/*.${options.templateExtension}`)
            ]);
            self.watcher.on('add', loadByFileType);
            self.watcher.on('change', loadByFileType);
        },

        unwatch () {
            if (!self.watcher) {
                throw new Error('No files are being watched');
            }
            self.watcher.close();
            delete self.watcher;
        },

        render (name, context, done) {
            self.dust.render(name, context, done);
        },

        middleware (request, response, next) {
            const viewData = response[options.sourceProperty];
            if (viewData) {
                const templateName = viewData[options.templateProperty];
                return self.render(templateName, viewData, (error, output) => {
                    if (error) {
                        return next(error);
                    }
                    response.end(output);
                });
            }
            next();
        }

    };

    function loadByFileType (filePath) {
        const fileType = resolveFileType(filePath);
        const fileTypeCapitalized = upperCaseFirst(fileType);
        const name = relativePath(options[`${fileType}sPath`], filePath);
        return self[`load${fileTypeCapitalized}`](name);
    }

    function resolveFileType (filePath) {
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

    self.middleware.grime = self;
    return self;
}

function grimeMiddleware (options) {
    const renderer = module.exports.create(options);
    if (process.env.NODE_ENV === 'production') {
        renderer.load();
    }
    else {
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
