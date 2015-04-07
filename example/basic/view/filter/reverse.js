'use strict';

module.exports = reverse;

function reverse (value) {
    if (typeof value !== 'string') {
        return value;
    }
    return value.split('').reverse().join('');
}
