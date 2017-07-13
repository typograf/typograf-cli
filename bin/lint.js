'use strict';

const
    TypografObj = require('typograf'),
    TypografTitles = require('typograf/dist/typograf.titles.json');

function getTitle(rule) {
    const titles = TypografTitles[rule];
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

module.exports = {
    process(text, prefs) {
        const
            typograf = new TypografObj(prefs),
            enabledRules = [];

        for (const rule of typograf._rules) {
            if (
                typograf.isEnabledRule(rule.name) &&
                (rule._lang === 'common' || prefs.locale.indexOf(rule._lang))
            ) {
                enabledRules.push(rule.name);
            }
        }

        const errors = [];
        for (const rule of enabledRules) {
            typograf
                .disableRule('*')
                .enableRule(rule);

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
                console.error(`[ERR] ${prefs.filename}`);
            }

            for (const e of errors) {
                const pos = e.position || {};
                console.error('- ' + getTitle(e.name) + ' (' + e.name + '), line: ' + pos.line + ', col: ' + pos.column);
            }
        }
    }
};
