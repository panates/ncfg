/* eslint-disable */
require('./support/env');
const assert = require('assert');
const {Configuration, ValidationError} = require('..');
const path = require('path');

describe('Configuration', function() {

  const schema1 = {
    env: {
      doc: 'The application environment.',
      format: ['production', 'development', 'test'],
      default: 'development',
      env: 'NODE_ENV'
    },
    ip: {
      doc: 'The IP address to bind.',
      format: 'ip|url',
      default: '127.0.0.1',
      env: 'IP_ADDRESS'
    },
    port: {
      doc: 'The port to bind.',
      format: 'port',
      default: 8080,
      env: 'PORT'
    },
    sub: {
      doc: 'Sub properties',
      properties: {
        arg1: {
          doc: 'Sub arg-1',
          format: 'int',
          arg: 'testarg1'
        },
        arg2: {
          doc: 'Sub arg-2',
          format: 'string'
        },
        arg3: {
          format: 'int',
          default: 123
        },
        arg4: {
          format: ['aa', 'bb', 'cc']
        }
      }
    }
  };

  let config;

  beforeEach(function() {
    config = new Configuration();
  });

  it('should add child node', function() {
    config.addChild('a');
    assert.equal(config.children.a.parent, config);
    assert.equal(config.children.a.root, config);
  });

  it('should get node path', function() {
    const a = config.addChild('a');
    const b = a.addChild('b');
    assert.equal(config.path, '');
    assert.equal(a.path, 'a');
    assert.equal(b.path, 'a.b');
  });

  it('should define property', function() {
    config.define('prop1', {
      format: 'string'
    });
    assert.deepEqual(config._schema, {
      prop1: {format: 'string'}
    });
  });

  it('should define property - string argument', function() {
    config.define('prop1', 'string');
    assert.deepEqual(config._schema, {
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
  });

  it('should define() check "format" property exists and not empty', function() {
    assert.throws(() => {
      config.define('p1', {});
    }, /You must provide./g);
  });

  it('should define() check "format" exists', function() {
    assert.throws(() => {
      config.define('p1', {format: 'notexists'});
    }, /No such format./g);
  });

  it('should defineAll() define properties at once', function() {
    config.defineAll(schema1);
    assert.deepEqual(config.getSchema(), schema1);
  });

  it('should defineAll() validate argument type', function() {
    assert.throws(() => {
      config.defineAll(123);
    }, /You must provide./g);
  });

  it('should has() check if property exists', function() {
    config.defineAll(schema1);
    assert.equal(config.has('ip'), true);
    assert.equal(config.has('sub.arg1'), true);
    assert.equal(config.has('sub.nonexist'), false);
  });

  it('should get() validate first argument is string', function() {
    config.defineAll(schema1);
    assert.throws(() => {
      config.get();
    }, /You must provide.*/);
  });

  it('should return env value if value not set', function() {
    const o = config
        .defineAll(schema1);
    assert.equal(o.get('env'), 'test');
    o.set('env', 'production');
    assert.equal(o.get('env'), 'production');
  });

  it('should return arg value if value not set', function() {
    const o = config
        .defineAll(schema1);
    assert.equal(o.get('sub.arg1'), 8081);
    o.set('sub.arg1', 83);
    assert.equal(o.get('sub.arg1'), 83);
  });

  it('should return loaded value if value not set', function() {
    const o = config
        .defineAll(schema1)
        .load({sub: {arg3: 125}});
    assert.equal(o.get('sub.arg3'), 125);
    o.set('sub.arg3', 234);
    assert.equal(o.get('sub.arg3'), 234);
  });

  it('should return default value if value not set', function() {
    config.defineAll(schema1);
    assert.equal(config.get('sub.arg3'), 123);
  });

  it('should get() return assigned value by set()', function() {
    config.defineAll(schema1);
    config.set('ip', '127.0.0.2');
    config.set('sub.arg3', '234');
    assert.equal(config.get('ip'), '127.0.0.2');
    assert.equal(config.get('sub.arg3'), 234);
  });

  it('should get() throw if property is not defined', function() {
    assert.throws(() => {
      config.defineAll(schema1);
      config.get('unknown');
    }, /.*is not defined.*/g);
  });

  it('should set() throw if property is not defined', function() {
    assert.throws(() => {
      config.defineAll(schema1);
      config.set('unknown', 1);
    }, /.*is not defined.*/g);
  });

  it('should set() accept enum values if format is an array', function() {
    config.defineAll(schema1);
    config.set('sub.arg4', 'bb');
    assert.throws(() => {
      config.set('sub.arg4', 'abc');
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
    assert.equal(config.get('ip'), '127.0.0.2');
    assert.equal(config.get('sub.arg3'), 234);
    config.reset('ip');
    config.reset('sub.arg3');
    assert.equal(config.get('ip'), '127.0.0.1');
    assert.equal(config.get('sub.arg3'), 123);
  });

  it('should get all values as json object', function() {
    config.defineAll(schema1);
    config.set('ip', '127.0.0.2');
    config.set('sub.arg3', '234');
    let o = config.toJSON();
    assert.deepEqual(o, {
      env: 'test',
      ip: '127.0.0.2',
      port: 8080,
      sub: {
        arg1: 8081,
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
    }, /You must provide Object instance.*/);
  });

  it('should addFormat() validate "name" property defined', function() {
    assert.throws(() => {
      config.addFormat({});
    }, /You must provide "name" property.*/);
  });

  it('should add custom format', function() {
    config.addFormat({
      name: 'country-code',
      parse: (v) => String(v),
      validate: (v) => v && v.length === 2
    });
    config.define('country', 'country-code');
    config.set('country', 'TR');
    assert.equal(config.get('country'), 'TR');
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
    assert.deepEqual(o, {
      env: 'test', // read from env
      ip: '127.0.0.2',
      port: 8080,
      sub: {
        arg1: 8081, // read from args
        arg3: 234
      }
    });
  });

  it('should load from json file', function() {
    const o = config
        .defineAll(schema1)
        .loadFiles(path.join(__dirname, 'support', 'val1.json'))
        .toJSON();
    assert.deepEqual(o, {
      env: 'test',
      ip: '127.0.0.2',
      port: 8080,
      sub: {
        arg1: 8081,
        arg3: 234
      }
    });
  });

  it('should register file parser', function() {
    const o = config
        .defineAll(schema1)
        .addParsers({ext: 'jsonx', parse: JSON.parse})
        .loadFiles([path.join(__dirname, 'support', 'val1.jsonx')])
        .toJSON();
    assert.deepEqual(o, {
      env: 'test',
      ip: '127.0.0.2',
      port: 8080,
      sub: {
        arg1: 8081,
        arg3: 234
      }
    });
  });

});
