Командный интерфейс для Типографа
=============================
[![NPM version](https://img.shields.io/npm/v/typograf-cli.svg?style=flat)](https://www.npmjs.com/package/typograf-cli)
[![NPM downloads](https://img.shields.io/npm/dm/typograf-cli.svg?style=flat)](https://www.npmjs.com/package/typograf-cli)
[![Build Status](https://img.shields.io/travis/typograf/typograf-cli.svg?style=flat)](https://travis-ci.org/typograf/typograf-cli)
[![install size](https://packagephobia.com/badge?p=typograf-cli)](https://packagephobia.com/result?p=typograf-cli)

### Использование
```
npm install typograf-cli -g
```

`typograf` — вывод справки.

`typograf -l ru my_file.txt` — русская типографика.

`typograf -l ru --lint my_file.txt` — линтинг файла.

`typograf -l ru,en-US my_file.txt` — русская типографика, в тексте есть английские слова.

`typograf -l en-US my_file.txt` — американская типографика.

`typograf -l ru --html-entity-type name my_file.txt` — русская типографика, HTML-сущности как имена (`&nbsp`, `&raquo`, …).

`typograf -l ru --html-entity-type name --html-entity-only-invisible my_file.txt` — русская типографика, только пробельные HTML-сущности как имена.

`typograf -l ru -d "ru/punctuation/quote,common/nbsp/dpi" -e "ru/optalign/*" my_file.txt > new_my_file` — типографировать файл с отключёнными и включёнными правилами.

`typograf -l ru -c typograf.config.json my_file.txt` — типографировать файл с настройками из конфигурационного файла.

`typograf --init-config` — создаёт конфигурационный файл `.typograf.config.json` в текущей папке.

`typograf -l ru --only-json-keys "title,name,description" my_file.json` — типографировать в JSON-файле только указанные ключи.

`typograf -l ru --ignore-json-keys "code,date" my_file.json` — не типографировать в JSON-файле указанные ключи.

`cat my_file.txt | typograf --stdin`

`cat my_file.txt | typograf --stdin --stdin-filename=my_file.txt`

## Конфигурационный файл
При указании опции `--init-config` будет создан конфигурационный файл `.typograf.json` в текущей папке:
```json
{
    "locale": ["ru", "en-US"],
    "disableRule": [],
    "enableRule": [],
    "onlyJsonKeys": [],
    "ignoreJsonKeys": [],
    "htmlEntity": {
        "type": "default",
        "onlyInvisible": false
    }
}
```
Опции из командной строки имеют более высокий приоритет, чем из конфигурационного файла.

Пример конфигурационного файла:
```json
{
    "locale": ["ru", "en-US"],
    "disableRule": ["common/nbsp/*"],
    "enableRule": [],
    "onlyJsonKeys": [],
    "ignoreJsonKeys": ["comment", "phone"],
    "htmlEntity": {
        "type": "default",
        "onlyInvisible": false
    }
}
```
[Список правил](https://github.com/typograf/typograf/blob/dev/docs/RULES.ru.md)


## [Лицензия](./LICENSE.md)
MIT License
