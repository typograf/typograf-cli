'use strict';

const
    program = require('commander'),
    exit = require('exit'),
    fs = require('fs'),
    path = require('path'),
    isutf8 = require('isutf8'),
    lint = require('./lint'),
    TypografObj = require('typograf'),
    typograf = new TypografObj();

function processText(text, prefs) {
    const isJSON = path.extname(prefs.filename.toLowerCase()) === '.json';

    if (prefs.lint) {
        !isJSON && lint.process(text, prefs);
    } else {
        if (isJSON) {
            processJSON(text, prefs);
        } else {
            process.stdout.write(typograf.execute(text, prefs));
        }
    }
}

function processJSON(text, prefs) {
    let json;
    try {
        json = JSON.parse(text);
    } catch(e) {
        console.error(`${prefs.filename}: error parsing.`);
        exit(1);
    }

    const result = JSON.stringify(json, (key, value) => {
        let needTypography = true;

        if (typeof value === 'string') {
            if (program.onlyJsonKeys && program.onlyJsonKeys.indexOf(key) === -1) {
                needTypography = false;
            }

            if (program.ignoreJsonKeys && program.ignoreJsonKeys.indexOf(key) > -1) {
                needTypography = false;
            }

            if (needTypography) {
                value = typograf.execute(value, prefs);
            }
        }

        return value;
    }, 2);

    process.stdout.write(result);
}

module.exports = {
    getDefaultConfigAsText() {
        return fs.readFileSync(path.resolve('./typograf.json'), 'utf8');
    },
    getConfig(file) {
        if (!file) {
            return null;
        }

        if (fs.existsSync(file) && fs.statSync(file).isFile()) {
            const text = fs.readFileSync(file, 'utf8');
            let config;
            try {
                config = JSON.parse(text);
            } catch(e) {
                console.error(`${file}: error parsing.`);
                return null;
            }

            return config;
        } else {
            console.error(`${file}: no such file.`);
        }

        return null;
    },

    getPrefs(program, config) {
        const prefs = {
            lint: program.lint,
            locale: [],
            htmlEntity: {}
        };

        for (const key of ['enableRule', 'disableRule', 'locale']) {
            if (typeof program[key] !== 'undefined') {
                prefs[key] = program[key];
            }

            if (config && typeof config[key] !== 'undefined') {
                prefs[key] = config[key];
            }
        }

        if (typeof program.htmlEntityType !== 'undefined') {
            prefs.htmlEntity.type = program.htmlEntityType;
        }

        if (typeof program.htmlEntityOnlyVisible !== 'undefined') {
            prefs.htmlEntity.onlyVisible = program.htmlEntityOnlyVisible;
        }

        if (config && config.htmlEntity) {
            prefs.htmlEntity = Object.assign(prefs.htmlEntity, config.htmlEntity);
        }

        return prefs;
    },

    processStdin(prefs, callback) {
        let text = '';

        process.stdin
            .setEncoding('utf8')
            .on('readable', () => {
                const chunk = process.stdin.read();
                if (chunk !== null) {
                    text += chunk;
                }
            })
            .on('end', () => {
                processText(text, prefs);
                callback();
            });
    },

    processFile(prefs, callback) {
        const file = prefs.filename;

        if (fs.existsSync(file) && fs.statSync(file).isFile()) {
            const text = fs.readFileSync(file);
            if (isutf8(text)) {
                processText(text.toString(), prefs);
            } else {
                callback(true, `${file}: is not UTF-8.`);
            }
        } else {
            callback(true, `${file}: no such file.`);
        }

        callback(false);
    }
};
