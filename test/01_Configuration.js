/* eslint-disable */
require('./support/env');
const assert = require('assert');
const ncfg = require('..');
const path = require('path');
const {ValidationError} = ncfg;

describe('Configuration', function() {

  const schema1 = {
    ip: {
      description: 'The IP address to bind.',
      format: 'url',
      default: '127.0.0.1',
      env: 'IP_ADDRESS'
    },
    port: {
      description: 'The port to bind.',
      format: 'port',
      default: '8080',
      env: 'PORT'
    },
    sub: {
      description: 'Sub properties',
      properties: {
        arg1: {
          description: 'Sub arg-1',
          format: 'int'
        },
        arg2: {
          description: 'Sub arg-2',
          format: 'string'
        },
        arg3: {
          format: 'duration',
          default: '1 sec'
        },
        arg4: {
          enum: ['aa', 'bb', 'cc']
        }
      }
    }
  };

  let config;

  beforeEach(function() {
    config = ncfg();
  });

  it('should define property- define(key:string, def:object)', function() {
    config.define('prop1', {
      format: 'string'
    });
    assert.deepStrictEqual(config._schema, {
      prop1: {format: 'string'}
    });
  });

  it('should define property - define(key:string, format:string)', function() {
    config.define('prop1', 'string');
    assert.deepStrictEqual(config._schema, {
      prop1: {format: 'string'}
    });
  });

  it('should define() validate first argument', function() {
    assert.throws(() => {
      config.define(123);
    }, /You must provide./g);
  });

  it('should define() validate second argument', function() {
    assert.throws(() => {
      config.define('a', 123);
    }, /You must provide./g);
    assert.throws(() => {
      config.define('p1', {});
    }, /You must provide/g);
  });

  it('should define() check "format" exists', function() {
    assert.throws(() => {
      config.define('p1', 'notexists');
    }, /Unknown format./g);
  });

  it('should define() check "format" is string', function() {
    assert.throws(() => {
      config.define('p1', {format: 123});
    }, /must be string/g);
  });

  it('should define multiple properties at once - defineAll()', function() {
    config.defineAll(schema1);
    assert.deepStrictEqual(config.getSchema(), schema1);
  });

  it('should defineAll() validate argument type', function() {
    assert.throws(() => {
      config.defineAll(123);
    }, /You must provide./g);
  });

  it('should add child node', function() {
    config.addChild('a');
    assert.strictEqual(config.children.a.parent, config);
    assert.strictEqual(config.children.a.root, config);
  });

  it('should get node path', function() {
    const a = config.addChild('a');
    const b = a.addChild('b');
    assert.strictEqual(config.path, '');
    assert.strictEqual(a.path, 'a');
    assert.strictEqual(b.path, 'a.b');
  });

  it('should check if property exists - has()', function() {
    config.defineAll(schema1);
    assert.strictEqual(config.has('ip'), true);
    assert.strictEqual(config.has('sub.arg1'), true);
    assert.strictEqual(config.has('sub.nonexist'), false);
  });

  it('should get() return value assigned using set()', function() {
    const o = config.define('prop1', {
      format: 'number',
      default: 80
    });
    o.set('prop1', 234);
    assert.strictEqual(o.get('prop1'), 234);
  });

  it('should get() return original value', function() {
    const o = config.define('prop1', {
      format: 'duration'
    });
    o.set('prop1', '1 sec');
    assert.strictEqual(o.get('prop1'), 1000);
    assert.strictEqual(o.get('prop1', true), '1 sec');
  });

  it('should get() return loaded value (if value not set)', function() {
    const o = config.define('prop1', {
      format: 'number',
      default: 80
    });
    config.load({prop1: 8081});
    assert.strictEqual(o.get('prop1'), 8081);
  });

  it('should get() return env value (if value not set)', function() {
    const o = config.define('prop1', {
      enum: ['production', 'development', 'test'],
      default: 'development',
      env: 'NODE_ENV'
    });
    assert.strictEqual(o.get('prop1'), 'test');
    o.set('prop1', 'production');
    assert.strictEqual(o.get('prop1'), 'production');
  });

  it('should get() return arg value (if value not set)', function() {
    const o = config.define('prop1', {
      format: 'number',
      arg: 'testarg1',
      default: 80
    });
    assert.strictEqual(o.get('prop1'), 8081);
  });

  it('should get() return default value (if value not set)', function() {
    const o = config.define('prop1', {
      format: 'number',
      default: 80
    });
    assert.strictEqual(o.get('prop1'), 80);
  });

  it('should get() return original default value', function() {
    const o = config.define('prop1', {
      format: 'duration',
      default: '1 sec'
    });
    assert.strictEqual(o.get('prop1'), 1000);
    assert.strictEqual(o.get('prop1', true), '1 sec');
  });

  it('should get() throw if property is not defined', function() {
    assert.throws(() => {
      config.get('unknown');
    }, /.*is not defined.*/g);
  });

  it('should get() validate first argument is string', function() {
    config.defineAll(schema1);
    assert.throws(() => {
      config.get();
    }, /You must provide.*/);
  });

  it('should set() throw if property is not defined', function() {
    assert.throws(() => {
      config.set('unknown', 1);
    }, /.*is not defined.*/g);
  });

  it('should set enum values', function() {
    config.define('enum1', [1, 2, 3]);
    config.define('enum2', {enum: 'a'});
    config.define('enum3', {enum: 'a'});
    config.set('enum1', 1);
    config.set('enum2', 'a');
    assert.throws(() => {
      config.set('enum1', 'e');
    }, /Validation error.*/g);
    assert.throws(() => {
      config.set('enum2', 'b');
    }, /Validation error.*/g);
    assert.strictEqual(config.get('enum1'), 1);
    assert.strictEqual(config.get('enum2'), 'a');
  });

  it('should set array values', function() {
    config.define('array1', '[string]');
    config.define('array2', '[int]');
    config.set('array1', [1, 2, 3]);
    config.set('array2', 1);
    assert.throws(() => {
      config.set('array1', {});
    }, /Validation error.*/g);
    assert.deepStrictEqual(config.get('array1'), ['1', '2', '3']);
    assert.deepStrictEqual(config.get('array2'), [1]);
  });

  it('should set() throw if property is not valid', function() {
    assert.throws(() => {
      config.define('port', 'port');
      config.set('port', -1);
    }, /Validation error.*/g);
  });

  it('should use multiple formats', function() {
    config.defineAll(schema1);
    config.set('ip', '127.0.0.1');
    config.set('ip', 'localhost');
    assert.throws(() => {
      config.set('ip', 123);
    }, /Validation error.*/g);
  });

  it('should default() throw if property is not defined', function() {
    assert.throws(() => {
      config.defineAll(schema1);
      config.default('unknown');
    }, /.*is not defined.*/g);
  });

  it('should reset value to default', function() {
    config.defineAll(schema1);
    config.set('ip', '127.0.0.2');
    config.set('sub.arg3', '234');
    assert.strictEqual(config.get('ip'), '127.0.0.2');
    assert.strictEqual(config.get('sub.arg3'), 234);
    config.reset('ip');
    config.reset('sub.arg3');
    assert.strictEqual(config.get('ip'), '127.0.0.1');
    assert.strictEqual(config.get('sub.arg3'), 1000);
  });

  it('should get all values as json object', function() {
    config.defineAll(schema1);
    config.set('ip', '127.0.0.2');
    config.set('sub.arg3', '234');
    let o = config.toJSON();
    assert.deepStrictEqual(o, {
      ip: '127.0.0.2',
      port: 8080,
      sub: {
        arg3: 234
      }
    });
  });

  it('should validate build error list', function() {
    config.defineAll(schema1);
    config.load({ip: NaN, port: NaN, sub: {arg3: NaN}});
    const list = config.validate();
    assert(list.ip instanceof ValidationError);
    assert(list.port instanceof ValidationError);
    assert(list.ip instanceof ValidationError);
    assert(list.sub.arg3 instanceof ValidationError);
  });

  it('should validate build flat error list', function() {
    config.defineAll(schema1);
    config.load({ip: NaN, port: NaN, sub: {arg3: NaN}});
    const list = config.validate({flat: true});
    assert(list.ip instanceof ValidationError);
    assert(list.port instanceof ValidationError);
    assert(list.ip instanceof ValidationError);
    assert(list['sub.arg3'] instanceof ValidationError);
  });

  it('should validate throw at first error if bail true', function() {
    config.defineAll(schema1);
    config.load({ip: NaN, port: NaN, sub: {arg3: NaN}});
    assert.throws(() => {
      config.validate({bail: true});
    }, /Validation error.*/);
  });

  it('should addFormat() validate first argument', function() {
    assert.throws(() => {
      config.addFormat(123);
    }, /You must provide/);
  });

  it('should addFormat() validate second argument', function() {
    assert.throws(() => {
      config.addFormat('prop1');
    }, /You must provide/);
  });

  it('should addFormat() validate "name" property defined', function() {
    assert.throws(() => {
      config.addFormat({});
    }, /You must provide string value.*/);
  });

  it('should add custom format', function() {
    config.addFormat('country-code', {
      parse: (v) => String(v),
      validate: (v) => v && v.length === 2
    });
    config.define('country', 'country-code');
    config.set('country', 'TR');
    assert.strictEqual(config.get('country'), 'TR');
    assert.throws(() => {
      config.set('country', 'TRY');
    }, /Validation error.*/);
  });

  it('should load values from object', function() {
    const o = config
        .defineAll(schema1)
        .load({
          ip: '127.0.0.2',
          sub: {arg3: 234}
        })
        .toJSON();
    assert.deepStrictEqual(o, {
      ip: '127.0.0.2',
      port: 8080,
      sub: {
        arg3: 234
      }
    });
  });

  it('should load from json file', function() {
    const o = config
        .defineAll(schema1)
        .loadFiles(path.join(__dirname, 'support', 'val1.json'))
        .toJSON();
    assert.deepStrictEqual(o, {
      ip: '127.0.0.2',
      port: 8080,
      sub: {
        arg3: 234
      }
    });
  });

  it('should register multi file parser', function() {
    const o = config
        .defineAll(schema1)
        .addParsers({jsonx: [() => null, JSON.parse]})
        .loadFiles([path.join(__dirname, 'support', 'val1.jsonx')])
        .toJSON();
    assert.deepStrictEqual(o, {
      ip: '127.0.0.2',
      port: 8080,
      sub: {
        arg3: 234
      }
    });
  });

  it('should throw if parser returns a value different than an object instance', function() {
    assert.throws(() => {
      config
          .defineAll(schema1)
          .addParsers({jsonx: () => '123'})
          .loadFiles([path.join(__dirname, 'support', 'val1.jsonx')]);
    });
  });

});
