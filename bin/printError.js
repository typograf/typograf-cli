'use strict';

const chalk = require('chalk');

module.exports = function printError(text) {
    console.error(chalk.red(text));
};
