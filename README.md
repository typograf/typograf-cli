Командный интерфейс для Типографа
=============================
[![NPM version](https://img.shields.io/npm/v/typograf-cli.svg?style=flat)](https://www.npmjs.com/package/typograf-cli)
[![NPM downloads](https://img.shields.io/npm/dm/typograf-cli.svg?style=flat)](https://www.npmjs.com/package/typograf-cli)
[![Build Status](https://img.shields.io/travis/typograf/typograf-cli.svg?style=flat)](https://travis-ci.org/typograf/typograf-cli)
[![Dependency Status](https://img.shields.io/david/typograf/typograf-cli.svg?style=flat)](https://david-dm.org/typograf/typograf-cli)

### Использование
```
npm install typograf-cli -g
```
`typograf` — вывод справки

`typograf -l ru my_file.txt` — русская типографика

`typograf -l ru,en-US my_file.txt` — русская типографика, в тексте есть английские слова

`typograf -l en-US my_file.txt` — американская типографика

`typograf -l ru -d "ru/punctuation/quote,common/nbsp/dpi" -e "ru/optalign/*" my_file.txt > new_my_file` — типографировать файл с отключёнными и включёнными правилами.

## [Лицензия](./LICENSE.md)
MIT License
