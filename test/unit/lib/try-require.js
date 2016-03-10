// jscs:disable maximumLineLength
'use strict';

const assert = require('proclaim');
const mockery = require('mockery');

describe('lib/try-require', () => {
    let fooModule;
    let tryRequire;

    beforeEach(() => {
        fooModule = {};
        mockery.registerMock('foo', fooModule);
        tryRequire = require('../../../lib/try-require');
    });

    it('should be a function', () => {
        assert.isFunction(tryRequire);
    });

    describe('tryRequire()', () => {

        it('should return the required module if it exists', () => {
            assert.strictEqual(tryRequire('foo'), fooModule);
        });

        it('should return `undefined` if a module does not exist', () => {
            assert.isUndefined(tryRequire('bar'));
        });

        it('should not throw if a module does not exist', () => {
            assert.doesNotThrow(() => {
                tryRequire('bar');
            });
        });

    });

});
