import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import pico from 'picocolors';
import Typograf from 'typograf';

import printError from './printError.mjs';

const isWin = process.platform === 'win32';
const errSym = isWin ? '[ERR]' : '✗';

const typografModulePath = fileURLToPath(import.meta.resolve('typograf'));
const titlesPath = join(dirname(typografModulePath), 'typograf.titles.json');
const typografTitles = JSON.parse(readFileSync(titlesPath, 'utf8'));

function getTitle(rule) {
    const titles = typografTitles[rule];
    return titles && (titles.common || titles['en-US']);
}

function getPosition(before, after) {
    let line = 0;
    let column = 0;

    for (let i = 0; i < before.length && i < after.length; i++) {
        const ch = before[i];

        if (ch !== after[i]) {
            break;
        }

        if (ch === '\n') {
            column = 0;
            line++;
        } else if (ch === '\r') {
            continue;
        }

        column++;
    }

    return {
        line: line + 1,
        column: column + 1
    };
}

export default {
    process(text, prefs) {
        const typograf = new Typograf(prefs);
        const enabledRules = [];

        for (const rule of Typograf.getRules()) {
            if (
                typograf.isEnabledRule(rule.name) &&
                (rule.lang === 'common' || prefs.locale.indexOf(rule.lang))
            ) {
                enabledRules.push(rule.name);
            }
        }

        const errors = [];
        for (const rule of enabledRules) {
            typograf.disableRule('*');
            typograf.enableRule(rule);

            const result = typograf.execute(text);

            if (result !== text) {
                errors.push({
                    name: rule,
                    position: getPosition(text, result)
                });
            }
        }

        if (errors.length) {
            if (prefs.filename) {
                printError(`${errSym} ${prefs.filename}`);
            }

            for (const e of errors) {
                const pos = e.position || {};
                printError(`- ${e.name}: ${getTitle(e.name)} ${pico.cyan(`(${pos.line}:${pos.column})`)}`);
            }
        }
    }
};
