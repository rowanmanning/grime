'use strict';

const sinon = require('sinon');
const _ = require('underscore');

module.exports = {
    defaults: sinon.spy(_.defaults)
};
