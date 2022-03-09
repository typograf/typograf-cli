#!/usr/bin/env node

'use strict';

const exit = require('exit');
const fs = require('fs');
const path = require('path');
const program = require('commander');
const utils = require('./utils');
const printError = require('./printError');
const Typograf = require('typograf');
const locales = Typograf.getLocales();
const types = ['digit', 'name', 'default'];

function splitByCommas(str) {
    return (str || '').split(/[,;]/).map(val => val.trim());
}

program
    .version(require('../package.json').version)
    .usage('[options] <file>')
    .option('-l, --locale <locale>', `set the locale for rules (separated by commas). Available locales: "${locales.join('", "')}". Default: ru`, splitByCommas)
    .option('-d, --disable-rule <rule>', 'disable rules (separated by commas)', splitByCommas)
    .option('-e, --enable-rule <rule>', 'enable rules (separated by commas)', splitByCommas)
    .option('-c, --config <file>', 'use configuration from this file')
    .option('--lint', 'alpha mode, lint text with selected rules')
    .option('--stdin', 'process text provided on <STDIN>')
    .option('--stdin-filename <file>', 'specify filename to process STDIN as')
    .option('--init-config', 'save default configuration in current directory')
    .option('--only-json-keys <keys>', 'only JSON keys (separated by commas)', splitByCommas)
    .option('--ignore-json-keys <keys>', 'ignore JSON keys (separated by commas)', splitByCommas)
    .option('--html-entity-type <type>', 'HTML entities as: "digit" - &#160;, "name" - &nbsp, "default" - UTF-8 symbols')
    .option('--html-entity-only-invisible', 'convert only invisible symbols to reqiured view')
    .option('--no-color', 'clean output without colors');

program.parse(process.argv);

const opts = program.opts();

if (opts.initConfig) {
    const currentDir =  path.resolve('./');
    try {
        fs.writeFileSync('.typograf.json', utils.getDefaultConfigAsText());
        console.log(`Successfully created .typograf.json file in ${currentDir}`);
        exit(0);
    } catch(e) {
        printError(`Can't save .typograf.json file in ${currentDir}`);
        exit(1);
    }
}

if (!opts.stdin && program.rawArgs.length < 3) {
    program.help();
}

const config = utils.getConfig(opts.config);
const prefs = utils.getPrefs(config);

if (!prefs.locale.length) {
    printError('Error: required parameter locale.');
    exit(1);
}

for (const locale of prefs.locale) {
    if (!Typograf.hasLocale(locale)) {
        printError(`Error: locale "${locale}" is not supported.`);
        exit(1);
    }
}

if (types.indexOf(prefs.htmlEntity.type || 'default') === -1) {
    printError(`Error: mode "${prefs.htmlEntity.type}" is not supported.`);
    exit(1);
}

if (opts.stdin) {
    prefs.filename = opts.stdinFilename || '';
    utils.processStdin(prefs, () => {
        exit(0);
    });
} else {
    prefs.filename = program.args[0];

    if (!prefs.filename) {
        printError(`Error: file isn't specified.`);
        exit(1);
    }

    utils.processFile(prefs, (error, data) => {
        if (error) {
            printError(data);
            exit(1);
        } else {
            exit(0);
        }
    });
}
