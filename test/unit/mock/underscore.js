'use strict';

var sinon = require('sinon');
var _ = require('underscore');

module.exports = {
    defaults: sinon.spy(_.defaults)
};
