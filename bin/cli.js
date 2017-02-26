#!/usr/bin/env node

'use strict';

const fs = require('fs');
const isutf8 = require('isutf8');
const exit = require('exit');
const program = require('commander');
const TypografObj = require('typograf');

const typograf = new TypografObj();
const locales = TypografObj.getLocales();
const modes = ['digit', 'name', 'default'];

function splitByCommas(str) {
    return (str || '').split(/[,;]/);
}

program
    .version(require('../package.json').version)
    .usage('[options] <file>')
    .option('-d, --disable <rules>', 'disable rules (separated by commas)', splitByCommas, null)
    .option('-e, --enable <rules>', 'enable rules (separated by commas)', splitByCommas, null)
    .option(`-l, --locale <locale>`, `set the locale for rules (separated by commas). Available locales: "${locales.join('", "')}".`, splitByCommas, [])
    .option('--mode <mode>', 'HTML entities as: "digit" - &#160;, "name" - &nbsp, "default" - UTF-8 symbols')
    .parse(process.argv);

function printText(text) {
    process.stdout.write(
        typograf.execute(text, {
            enableRule: program.enable,
            disableRule: program.disable,
            locale: program.locale,
            htmlEntity: {type: program.mode}
        })
    );
}

if(process.stdin.isTTY && !program.args.length) {
    program.help();
}

if(!program.locale.length) {
    console.error('Error: required parameter locale.');
    exit(1);
}

program.locale.forEach(function(loc) {
    if(!TypografObj.hasLocale(loc)) {
        console.error(`Error: locale "${loc}" is not supported.`);
        exit(1);
    }
});


if(modes.indexOf(program.mode || 'default') === -1) {
    console.error(`Error: mode "${program.mode}" is not supported.`);
    exit(1);
}

const file = program.args[0];
const stdin = process.stdin;

let buf = '';

if(stdin.isTTY) {
    if(fs.existsSync(file) && fs.statSync(file).isFile()) {
        buf = fs.readFileSync(file);
        if(isutf8(buf)) {
            printText(buf);
        } else {
            console.error(`${file}: is not UTF-8`);
            exit(1);
        }
    } else {
        console.error(`${file}: no such file`);
        exit(1);
    }

    exit(0);
} else {
    stdin
        .setEncoding('utf8')
        .on('readable', function() {
            const chunk = process.stdin.read();
            if(chunk !== null) {
                buf += chunk;
            }
        })
        .on('end', function() {
            printText(buf);
            exit(0);
        });
}
