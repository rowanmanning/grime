'use strict';

var sinon = require('sinon');

module.exports = {
    Gaze: sinon.stub().returns({
        close: sinon.spy(),
        on: sinon.spy()
    })
};
