#!/usr/bin/env node

'use strict';

const
    exit = require('exit'),
    fs = require('fs'),
    path = require('path'),
    program = require('commander'),
    utils = require('./utils'),
    Typograf = require('typograf'),
    locales = Typograf.getLocales(),
    types = ['digit', 'name', 'default'];

function splitByCommas(str) {
    return (str || '').split(/[,;]/).map(val => val.trim());
}

program
    .version(require('../package.json').version)
    .usage('[options] <file>')
    .option('-l, --locale <locale>', `Set the locale for rules (separated by commas). Available locales: "${locales.join('", "')}"`, splitByCommas, [])
    .option('-d, --disable-rule <rule>', 'Disable rules (separated by commas)', splitByCommas, null)
    .option('-e, --enable-rule <rule>', 'Enable rules (separated by commas)', splitByCommas, null)
    .option('--lint', 'Beta mode, lint text with selected rules - default: false')
    .option('--stdin', 'Process text provided on <STDIN> - default: false')
    .option('--stdin-filename <file>', 'Specify filename to process STDIN as')
    .option('--config <file>', 'Use configuration from this file')
    .option('--init-config', 'Save default configuration in current directory')
    .option('--only-json-keys <keys>', 'Only JSON keys (separated by commas)', splitByCommas, null)
    .option('--ignore-json-keys <keys>', 'Ignore JSON keys (separated by commas)', splitByCommas, null)
    .option('--html-entity-type <type>', 'HTML entities as: "digit" - &#160;, "name" - &nbsp, "default" - UTF-8 symbols')
    .option('--html-entity-only-invisible', 'Convert only invisible symbols to reqiured view')
    .parse(process.argv);

if (!program.stdin && !program.args.length) {
    program.help();
}

if (program.initConfig) {
    const currentDir =  path.resolve('./');
    try {
        fs.writeFileSync('./.typograf.json', utils.getDefaultConfigAsText());
        console.log(`Successfully created .typograf.json file in ${currentDir}`);
        exit(0);
    } catch(e) {
        console.error(`Can't save .typograf.json file in ${currentDir}`);
        exit(1);
    }
}

const
    config = utils.getConfig(program.config),
    prefs = utils.getPrefs(program, config);

if (!prefs.locale.length) {
    console.error('Error: required parameter locale.');
    exit(1);
}

for (const locale of prefs.locale) {
    if (!Typograf.hasLocale(locale)) {
        console.error(`Error: locale "${locale}" is not supported.`);
        exit(1);
    }
}

if (types.indexOf(prefs.htmlEntity.type || 'default') === -1) {
    console.error(`Error: mode "${prefs.htmlEntity.type}" is not supported.`);
    exit(1);
}

if (program.stdin) {
    prefs.filename = program.stdinFilename || '';
    utils.processStdin(prefs, () => {
        exit(0);
    });
} else {
    prefs.filename = program.args[0];

    if (!prefs.filename) {
        console.log(`Error: file isn't specified.`);
        exit(1);
    }

    utils.processFile(prefs, (error, data) => {
        if (error) {
            console.error(data);
            exit(1);
        } else {
            exit(0);
        }
    });
}
