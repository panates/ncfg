/* eslint-disable */
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
      env: 'PORT',
      arg: 'port'
    },
    sub: {
      doc: 'Sub properties',
      properties: {
        arg1: {
          doc: 'Sub arg-1',
          format: 'String'
        },
        arg2: {
          doc: 'Sub arg-2',
          format: 'int',
          default: 123
        },
        arg3: {
          format: ['aa', 'bb', 'cc']
        }
      }
    }
  };

  it('should construct', function() {
    new Configuration();
  });

  it('should add child', function() {
    const config = new Configuration();
    config.addChild('a');
    assert.equal(config.children.a.parent, config);
    assert.equal(config.children.a.root, config);
  });

  it('should get node path', function() {
    const config = new Configuration();
    const a = config.addChild('a');
    const b = a.addChild('b');
    assert.equal(config.path, '');
    assert.equal(a.path, 'a');
    assert.equal(b.path, 'a.b');
  });

  it('should define property', function() {
    const config = new Configuration();
    config.define('prop1', {
      format: 'string'
    });
    assert.deepEqual(config._schema, {
      prop1: {format: 'string'}
    });
  });

  it('should define property by giving format name', function() {
    const config = new Configuration();
    config.define('prop1', 'string');
    assert.deepEqual(config._schema, {
      prop1: {format: 'string'}
    });
  });

  it('should define properties at once', function() {
    const config = new Configuration();
    config.defineAll(schema1);
    assert.deepEqual(config.getSchema(), schema1);
  });

  it('should define() validate first argument', function() {
    assert.throws(() => {
      const config = new Configuration();
      config.define(123);
    }, /You must provide./g);
  });

  it('should define() validate second argument', function() {
    assert.throws(() => {
      const config = new Configuration();
      config.define('a', 123);
    }, /You must provide./g);
  });

  it('should define() check "format" property exists and not empty', function() {
    assert.throws(() => {
      const config = new Configuration();
      config.define('p1', {});
    }, /You must provide./g);
  });

  it('should define() check "format" exists', function() {
    assert.throws(() => {
      const config = new Configuration();
      config.define('p1', {format: 'notexists'});
    }, /No such format./g);
  });

  it('should defineAll() validate argument type', function() {
    assert.throws(() => {
      const config = new Configuration();
      config.defineAll(123);
    }, /You must provide./g);
  });

  it('should has() check if property exists', function() {
    const config = new Configuration();
    config.defineAll(schema1);
    assert.equal(config.has('ip'), true);
    assert.equal(config.has('sub.arg1'), true);
    assert.equal(config.has('sub.nonexist'), false);
  });

  it('should get() validate first argument is string', function() {
    const config = new Configuration();
    config.defineAll(schema1);
    assert.throws(() => {
      config.get();
    }, /You must provide.*/);
  });

  it('should get() return default value if not set', function() {
    const config = new Configuration();
    config.defineAll(schema1);
    assert.equal(config.get('ip'), '127.0.0.1');
    assert.equal(config.get('sub.arg2'), 123);
  });

  it('should get() return assigned value by set()', function() {
    const config = new Configuration();
    config.defineAll(schema1);
    config.set('ip', '127.0.0.2');
    config.set('sub.arg2', '234');
    assert.equal(config.get('ip'), '127.0.0.2');
    assert.equal(config.get('sub.arg2'), 234);
  });

  it('should get() throw if property is not defined', function() {
    assert.throws(() => {
      const config = new Configuration();
      config.defineAll(schema1);
      config.get('unknown');
    }, /.*is not defined.*/g);
  });

  it('should set() throw if property is not defined', function() {
    assert.throws(() => {
      const config = new Configuration();
      config.defineAll(schema1);
      config.set('unknown', 1);
    }, /.*is not defined.*/g);
  });

  it('should set() accept enum values if format is an array', function() {
    const config = new Configuration();
    config.defineAll(schema1);
    config.set('sub.arg3', 'bb');
    assert.throws(() => {
      config.set('sub.arg3', 'abc');
    }, /Validation error.*/g);
  });

  it('should use multiple formats', function() {
    const config = new Configuration();
    config.defineAll(schema1);
    config.set('ip', '127.0.0.1');
    config.set('ip', 'localhost');
    assert.throws(() => {
      config.set('ip', 123);
    }, /Validation error.*/g);
  });

  it('should default() throw if property is not defined', function() {
    assert.throws(() => {
      const config = new Configuration();
      config.defineAll(schema1);
      config.default('unknown');
    }, /.*is not defined.*/g);
  });

  it('should reset value to default', function() {
    const config = new Configuration();
    config.defineAll(schema1);
    config.set('ip', '127.0.0.2');
    config.set('sub.arg2', '234');
    assert.equal(config.get('ip'), '127.0.0.2');
    assert.equal(config.get('sub.arg2'), 234);
    config.reset('ip');
    config.reset('sub.arg2');
    assert.equal(config.get('ip'), '127.0.0.1');
    assert.equal(config.get('sub.arg2'), 123);
  });

  it('should get all values as json object', function() {
    const config = new Configuration();
    config.defineAll(schema1);
    config.set('ip', '127.0.0.2');
    config.set('sub.arg2', '234');
    let o = config.toJSON();
    assert.deepEqual(o, {
      env: 'development',
      ip: '127.0.0.2',
      port: 8080,
      sub: {
        arg2: 234
      }
    });
  });

  it('should load from object', function() {
    const config = new Configuration();
    config.defineAll(schema1);
    config.set('sub.arg2', 234);
    config.load({ip: '127.0.0.2', sub: {arg2: undefined}});
    let o = config.toJSON();
    assert.deepEqual(o, {
      env: 'development',
      ip: '127.0.0.2',
      port: 8080,
      sub: {
        arg2: 123
      }
    });
  });

  it('should load from json file', function() {
    const config = new Configuration();
    config.defineAll(schema1);
    config.loadFiles(path.join(__dirname, 'support', 'val1.json'));
    let o = config.toJSON();
    assert.deepEqual(o, {
      env: 'development',
      ip: '127.0.0.2',
      port: 8080,
      sub: {
        arg2: 234
      }
    });
  });

  it('should register file parser', function() {
    const config = new Configuration();
    config.defineAll(schema1);
    config.addParsers({ext: 'jsonx', parse: JSON.parse});
    config.loadFiles([path.join(__dirname, 'support', 'val1.jsonx')]);
    let o = config.toJSON();
    assert.deepEqual(o, {
      env: 'development',
      ip: '127.0.0.2',
      port: 8080,
      sub: {
        arg2: 234
      }
    });
  });

  it('should validate build error list', function() {
    const config = new Configuration();
    config.defineAll(schema1);
    config.load({ip: NaN, port: NaN, sub: {arg2: NaN}});
    const list = config.validate();
    assert(list.ip instanceof ValidationError);
    assert(list.port instanceof ValidationError);
    assert(list.ip instanceof ValidationError);
    assert(list.sub.arg2 instanceof ValidationError);
  });

  it('should validate build flat error list', function() {
    const config = new Configuration();
    config.defineAll(schema1);
    config.load({ip: NaN, port: NaN, sub: {arg2: NaN}});
    const list = config.validate({flat: true});
    assert(list.ip instanceof ValidationError);
    assert(list.port instanceof ValidationError);
    assert(list.ip instanceof ValidationError);
    assert(list['sub.arg2'] instanceof ValidationError);
  });

  it('should validate throw at first error if bail true', function() {
    const config = new Configuration();
    config.defineAll(schema1);
    config.load({ip: NaN, port: NaN, sub: {arg2: NaN}});
    assert.throws(() => {
      config.validate({bail: true});
    }, /Validation error.*/);
  });

  it('should addFormat() validate first argument', function() {
    const config = new Configuration();
    assert.throws(() => {
      config.addFormat(123);
    }, /You must provide Object instance.*/);
  });

  it('should addFormat() validate "name" property defined', function() {
    const config = new Configuration();
    assert.throws(() => {
      config.addFormat({});
    }, /You must provide "name" property.*/);
  });

  it('should add custom format', function() {
    const config = new Configuration();
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

});
