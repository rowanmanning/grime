'use strict';

module.exports = randomNumber;

function randomNumber (chunk) {
    return chunk.write(Math.floor(Math.random() * 100));
}
