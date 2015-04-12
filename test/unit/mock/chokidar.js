'use strict';

var sinon = require('sinon');

module.exports = {
    watch: sinon.stub().returns({
        close: sinon.spy(),
        on: sinon.spy()
    })
};
