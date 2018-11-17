  
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

[![Dependencies][dependencies-image]][dependencies-url]
[![DevDependencies][devdependencies-image]][devdependencies-url]
[![Package Quality][quality-image]][quality-url]


## About NCfg (Nested-Configuration)

NCfg helps applications to manage configurations within nested nodes. This saves your day if your application has many sub modules. 

## Features

- *Nested structure:* Configuration organized in a tree structure
- *Environmental variables:* Values can be derived from environmental variables
- *Command-line arguments:* Values can also be derived from command-line arguments
- *Validation:* Configurations are validated against given schema. Can throw immediately or generate a report with all errors that are found
- *Multi parser support:* Can register many file parsers like (json5, hjson, yaml, etc..) 

You can report bugs and discuss features on the [GitHub issues](https://github.com/panates/ncfg/issues) page


## Installation

```bash
$ npm install ncfg --save
```

## Node Compatibility

  - node >= 6.x
  
## Change log

To see changelog click [here](https://github.com/panates/ncfg/commits/master)

  
### License
ncfg is available under [MIT](LICENSE) license.

[npm-image]: https://img.shields.io/npm/v/ncfg.svg
[npm-url]: https://npmjs.org/package/ncfg
[travis-image]: https://img.shields.io/travis/panates/ncfg/master.svg
[travis-url]: https://travis-ci.org/panates/ncfg
[coveralls-image]: https://img.shields.io/coveralls/panates/ncfg/master.svg
[coveralls-url]: https://coveralls.io/r/panates/ncfg
[downloads-image]: https://img.shields.io/npm/dm/ncfg.svg
[downloads-url]: https://npmjs.org/package/ncfg
[dependencies-image]: https://david-dm.org/panates/ncfg/status.svg
[dependencies-url]:https://david-dm.org/panates/ncfg
[devdependencies-image]: https://david-dm.org/panates/ncfg/dev-status.svg
[devdependencies-url]:https://david-dm.org/panates/ncfg?type=dev
[quality-image]: http://npm.packagequality.com/shield/ncfg.png
[quality-url]: http://packagequality.com/#?package=ncfg
