'use strict';

const pico = require('picocolors');

module.exports = function printError(text) {
    console.error(pico.red(text));
};
