'use strict';

var sinon = require('sinon');

module.exports = {
    ClientRequest: sinon.stub().returns({}),
    ServerResponse: sinon.stub().returns({
        end: sinon.stub()
    })
};
