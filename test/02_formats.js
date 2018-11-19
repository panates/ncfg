/* eslint-disable */
const assert = require('assert');
const Configuration = require('../lib/Configuration');

describe('Formats', function() {

  let config;
  let stack;

  beforeEach(function() {
    config = new Configuration();
  });

  describe('String', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'string',
        x2: 'string',
        x3: 'string',
        x4: 'string',
        e1: 'string',
        e2: 'string'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: '-123.5',
        x4: 123.5,
        e1: NaN,
        e2: {}
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate String', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should validate Number', function() {
      assert(!stack.x4, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse String', function() {
      assert.strictEqual(config.get('x3'), '-123.5');
    });

    it('should parse Number', function() {
      assert.strictEqual(config.get('x4'), '123.5');
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

  });

  describe('Number', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'number',
        x2: 'number',
        x3: 'number',
        x4: 'number',
        x5: 'number',
        e1: 'number',
        e2: 'number',
        e3: 'number'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: 123.5,
        x4: -123.5,
        x5: '-123.5',
        e1: NaN,
        e2: {},
        e3: 'a123'
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate positive Number', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should validate negative Number', function() {
      assert(!stack.x4, 'Validation failed');
    });

    it('should validate Number String', function() {
      assert(!stack.x5, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should not validate String', function() {
      assert(stack.e3, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse positive number', function() {
      assert.strictEqual(config.get('x3'), 123.5);
    });

    it('should parse negative number', function() {
      assert.strictEqual(config.get('x4'), -123.5);
    });

    it('should parse Integer String', function() {
      assert.strictEqual(config.get('x5'), -123.5);
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

    it('should not parse text', function() {
      assert.throws(() => config.get('e3'), /Validation error./g);
    });

  });

  describe('int - Integer number', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'int',
        x2: 'int',
        x3: 'int',
        x4: 'int',
        x5: 'int',
        e1: 'int',
        e2: 'int',
        e3: 'int',
        e4: 'int'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: 123,
        x4: -123,
        x5: '-123',
        e1: NaN,
        e2: {},
        e3: 'a123',
        e4: 123.5
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate positive Integers', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should validate negative Integers', function() {
      assert(!stack.x4, 'Validation failed');
    });

    it('should validate Integer String', function() {
      assert(!stack.x5, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should not validate String', function() {
      assert(stack.e3, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse positive number', function() {
      assert.strictEqual(config.get('x3'), 123);
    });

    it('should parse negative number', function() {
      assert.strictEqual(config.get('x4'), -123);
    });

    it('should parse Integer String', function() {
      assert.strictEqual(config.get('x5'), -123);
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

    it('should not parse text', function() {
      assert.throws(() => config.get('e3'), /Validation error./g);
    });

    it('should not parse float number', function() {
      assert.throws(() => config.get('e4'), /Validation error./g);
    });

  });

  describe('natnum - Natural number', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'natnum',
        x2: 'natnum',
        x3: 'natnum',
        x4: 'natnum',
        x5: 'natnum',
        e1: 'natnum',
        e2: 'natnum',
        e3: 'natnum',
        e4: 'natnum',
        e5: 'natnum'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: 0,
        x4: 123,
        x5: '123',
        e1: NaN,
        e2: {},
        e3: 'a123',
        e4: 123.5,
        e5: -123
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate zero', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should validate positive integers', function() {
      assert(!stack.x4, 'Validation failed');
    });

    it('should validate Integer String', function() {
      assert(!stack.x5, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should not validate String', function() {
      assert(stack.e3, 'Validation failed');
    });

    it('should not validate float numbers', function() {
      assert(stack.e4, 'Validation failed');
    });

    it('should not validate negative numbers', function() {
      assert(stack.e5, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse zero integer', function() {
      assert.strictEqual(config.get('x3'), 0);
    });

    it('should parse positive integer', function() {
      assert.strictEqual(config.get('x4'), 123);
    });

    it('should parse Integer String', function() {
      assert.strictEqual(config.get('x5'), 123);
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

    it('should not parse text', function() {
      assert.throws(() => config.get('e3'), /Validation error./g);
    });

    it('should not parse float number', function() {
      assert.throws(() => config.get('e4'), /Validation error./g);
    });

    it('should not parse negative number', function() {
      assert.throws(() => config.get('e5'), /Validation error./g);
    });

  });

  describe('posnum - Positive number', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'posnum',
        x2: 'posnum',
        x3: 'posnum',
        x4: 'posnum',
        x5: 'posnum',
        e1: 'posnum',
        e2: 'posnum',
        e3: 'posnum',
        e4: 'posnum',
        e5: 'posnum'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: 0,
        x4: 123.5,
        x5: '123.5',
        e1: NaN,
        e2: {},
        e3: 'a123',
        e4: -123,
        e5: -123.5
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate zero', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should validate positive integers', function() {
      assert(!stack.x4, 'Validation failed');
    });

    it('should validate Integer String', function() {
      assert(!stack.x5, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should not validate String', function() {
      assert(stack.e3, 'Validation failed');
    });

    it('should not validate negative integers', function() {
      assert(stack.e4, 'Validation failed');
    });

    it('should not validate negative numbers', function() {
      assert(stack.e5, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse zero integer', function() {
      assert.strictEqual(config.get('x3'), 0);
    });

    it('should parse positive integer', function() {
      assert.strictEqual(config.get('x4'), 123.5);
    });

    it('should parse Integer String', function() {
      assert.strictEqual(config.get('x5'), 123.5);
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

    it('should not parse text', function() {
      assert.throws(() => config.get('e3'), /Validation error./g);
    });

    it('should not parse negative integer', function() {
      assert.throws(() => config.get('e4'), /Validation error./g);
    });

    it('should not parse negative number', function() {
      assert.throws(() => config.get('e5'), /Validation error./g);
    });

  });

  describe('url', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'url',
        x2: 'url',
        x3: 'url',
        x4: 'url',
        e1: 'url',
        e2: 'url',
        e3: 'url'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: 'localhost',
        x4: '127.0.0.1',
        e1: NaN,
        e2: {},
        e3: 123
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate domain name', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should validate ip address', function() {
      assert(!stack.x4, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should not validate Number', function() {
      assert(stack.e3, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse domain name', function() {
      assert.strictEqual(config.get('x3'), 'localhost');
    });

    it('should parse ip address', function() {
      assert.strictEqual(config.get('x4'), '127.0.0.1');
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

    it('should not parse Number', function() {
      assert.throws(() => config.get('e3'), /Validation error./g);
    });

  });

  describe('ip - IP Address', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'ip',
        x2: 'ip',
        x3: 'ip',
        x4: 'ip',
        e1: 'ip',
        e2: 'ip',
        e3: 'ip',
        e4: 'ip'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: '127.0.0.1',
        x4: '1234:5678:9ABC:DEF0:1234:5678:9ABC:DEF0',
        e1: NaN,
        e2: {},
        e3: 123,
        e4: 'localhost'
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate ipv4', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should validate ipv6', function() {
      assert(!stack.x4, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should not validate Number', function() {
      assert(stack.e3, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse ipv4', function() {
      assert.strictEqual(config.get('x3'), '127.0.0.1');
    });

    it('should parse ipv6', function() {
      assert.strictEqual(config.get('x4'), '1234:5678:9ABC:DEF0:1234:5678:9ABC:DEF0');
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

    it('should not parse Number', function() {
      assert.throws(() => config.get('e3'), /Validation error./g);
    });

    it('should not parse text', function() {
      assert.throws(() => config.get('e4'), /Validation error./g);
    });

  });

  describe('port - Port number', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'port',
        x2: 'port',
        x3: 'port',
        x4: 'port',
        e1: 'port',
        e2: 'port',
        e3: 'port',
        e4: 'port'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: 8080,
        x4: '8080',
        e1: NaN,
        e2: {},
        e3: -80,
        e4: 'localhost'
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate port number', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should validate port number string', function() {
      assert(!stack.x4, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should not validate negative number', function() {
      assert(stack.e3, 'Validation failed');
    });

    it('should not validate string', function() {
      assert(stack.e4, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse port number', function() {
      assert.strictEqual(config.get('x3'), 8080);
    });

    it('should parse string port number', function() {
      assert.strictEqual(config.get('x4'), 8080);
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

    it('should not parse Number', function() {
      assert.throws(() => config.get('e3'), /Validation error./g);
    });

    it('should not parse String', function() {
      assert.throws(() => config.get('e4'), /Validation error./g);
    });

  });

  describe('wnp - Windows Named Pipe', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'wnp',
        x2: 'wnp',
        x3: 'wnp',
        e1: 'wnp',
        e2: 'wnp',
        e3: 'wnp',
        e4: 'wnp'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: '\\\\.\\pipe\\mypipe',
        e1: NaN,
        e2: {},
        e3: 123,
        e4: 'abcde'
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate named pipe string', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should not validate Number', function() {
      assert(stack.e3, 'Validation failed');
    });

    it('should not validate string', function() {
      assert(stack.e4, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse named pipe string', function() {
      assert.strictEqual(config.get('x3'), '\\\\.\\pipe\\mypipe');
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

    it('should not parse Number', function() {
      assert.throws(() => config.get('e3'), /Validation error./g);
    });

    it('should not parse text', function() {
      assert.throws(() => config.get('e4'), /Validation error./g);
    });

  });

  describe('email', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'email',
        x2: 'email',
        x3: 'email',
        e1: 'email',
        e2: 'email',
        e3: 'email',
        e4: 'email'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: 'my@email.com',
        e1: NaN,
        e2: {},
        e3: 123,
        e4: 'email.com'
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate email string', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should not validate Number', function() {
      assert(stack.e3, 'Validation failed');
    });

    it('should not validate domain string', function() {
      assert(stack.e4, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse email string', function() {
      assert.strictEqual(config.get('x3'), 'my@email.com');
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

    it('should not parse Number', function() {
      assert.throws(() => config.get('e3'), /Validation error./g);
    });

    it('should not parse text', function() {
      assert.throws(() => config.get('e4'), /Validation error./g);
    });

  });

  describe('uuid', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'uuid',
        x2: 'uuid',
        x3: 'uuid',
        x4: 'uuid',
        x5: 'uuid',
        e1: 'uuid',
        e2: 'uuid',
        e3: 'uuid',
        e4: 'uuid'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
        x4: 'cd4c9bf2-53db-408d-955a-eb3e2b93b8c3',
        x5: 'a6edc906-2f9f-5fb2-a373-efac406f0ef2',
        e1: NaN,
        e2: {},
        e3: 123,
        e4: 'abcd'
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate uuid v3 string', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should validate uuid v4 string', function() {
      assert(!stack.x4, 'Validation failed');
    });

    it('should validate uuid v5 string', function() {
      assert(!stack.x5, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should not validate Number', function() {
      assert(stack.e3, 'Validation failed');
    });

    it('should not validate string', function() {
      assert(stack.e4, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse uuid v3 string', function() {
      assert.strictEqual(config.get('x3'), 'a3bb189e-8bf9-3888-9912-ace4e6543002');
    });

    it('should parse uuid v4 string', function() {
      assert.strictEqual(config.get('x4'), 'cd4c9bf2-53db-408d-955a-eb3e2b93b8c3');
    });

    it('should parse uuid v5 string', function() {
      assert.strictEqual(config.get('x5'), 'a6edc906-2f9f-5fb2-a373-efac406f0ef2');
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

    it('should not parse Number', function() {
      assert.throws(() => config.get('e3'), /Validation error./g);
    });

    it('should not parse text', function() {
      assert.throws(() => config.get('e4'), /Validation error./g);
    });

  });

  describe('uuid3', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'uuid3',
        x2: 'uuid3',
        x3: 'uuid3',
        e1: 'uuid3',
        e2: 'uuid3',
        e3: 'uuid3',
        e4: 'uuid3',
        e5: 'uuid3',
        e6: 'uuid3'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
        e1: NaN,
        e2: {},
        e3: 123,
        e4: 'abcd',
        e5: 'cd4c9bf2-53db-408d-955a-eb3e2b93b8c3',
        e6: 'a6edc906-2f9f-5fb2-a373-efac406f0ef2'
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate uuid v3 string', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should not validate Number', function() {
      assert(stack.e3, 'Validation failed');
    });

    it('should not validate string', function() {
      assert(stack.e4, 'Validation failed');
    });

    it('should not validate uuid v4 string', function() {
      assert(stack.e5, 'Validation failed');
    });

    it('should not validate uuid v5 string', function() {
      assert(stack.e6, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse uuid v3 string', function() {
      assert.strictEqual(config.get('x3'), 'a3bb189e-8bf9-3888-9912-ace4e6543002');
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

    it('should not parse Number', function() {
      assert.throws(() => config.get('e3'), /Validation error./g);
    });

    it('should not parse text', function() {
      assert.throws(() => config.get('e4'), /Validation error./g);
    });

    it('should not parse uuid v4', function() {
      assert.throws(() => config.get('e5'), /Validation error./g);
    });

    it('should not parse uuid v5', function() {
      assert.throws(() => config.get('e6'), /Validation error./g);
    });

  });

  describe('uuid4', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'uuid4',
        x2: 'uuid4',
        x3: 'uuid4',
        e1: 'uuid4',
        e2: 'uuid4',
        e3: 'uuid4',
        e4: 'uuid4',
        e5: 'uuid4',
        e6: 'uuid4'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: 'cd4c9bf2-53db-408d-955a-eb3e2b93b8c3',
        e1: NaN,
        e2: {},
        e3: 123,
        e4: 'abcd',
        e5: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
        e6: 'a6edc906-2f9f-5fb2-a373-efac406f0ef2'
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate uuid v4 string', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should not validate Number', function() {
      assert(stack.e3, 'Validation failed');
    });

    it('should not validate string', function() {
      assert(stack.e4, 'Validation failed');
    });

    it('should not validate uuid v3 string', function() {
      assert(stack.e5, 'Validation failed');
    });

    it('should not validate uuid v5 string', function() {
      assert(stack.e6, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse uuid v4 string', function() {
      assert.strictEqual(config.get('x3'), 'cd4c9bf2-53db-408d-955a-eb3e2b93b8c3');
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

    it('should not parse Number', function() {
      assert.throws(() => config.get('e3'), /Validation error./g);
    });

    it('should not parse text', function() {
      assert.throws(() => config.get('e4'), /Validation error./g);
    });

    it('should not parse uuid v3', function() {
      assert.throws(() => config.get('e5'), /Validation error./g);
    });

    it('should not parse uuid v5', function() {
      assert.throws(() => config.get('e6'), /Validation error./g);
    });

  });

  describe('uuid5', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'uuid5',
        x2: 'uuid5',
        x3: 'uuid5',
        e1: 'uuid5',
        e2: 'uuid5',
        e3: 'uuid5',
        e4: 'uuid5',
        e5: 'uuid5',
        e6: 'uuid5'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: 'a6edc906-2f9f-5fb2-a373-efac406f0ef2',
        e1: NaN,
        e2: {},
        e3: 123,
        e4: 'abcd',
        e5: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
        e6: 'cd4c9bf2-53db-408d-955a-eb3e2b93b8c3'
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate uuid v5 string', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should not validate Number', function() {
      assert(stack.e3, 'Validation failed');
    });

    it('should not validate string', function() {
      assert(stack.e4, 'Validation failed');
    });

    it('should not validate uuid v3 string', function() {
      assert(stack.e5, 'Validation failed');
    });

    it('should not validate uuid v4 string', function() {
      assert(stack.e6, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse uuid v5 string', function() {
      assert.strictEqual(config.get('x3'), 'a6edc906-2f9f-5fb2-a373-efac406f0ef2');
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

    it('should not parse Number', function() {
      assert.throws(() => config.get('e3'), /Validation error./g);
    });

    it('should not parse text', function() {
      assert.throws(() => config.get('e4'), /Validation error./g);
    });

    it('should not parse uuid v3', function() {
      assert.throws(() => config.get('e5'), /Validation error./g);
    });

    it('should not parse uuid v4', function() {
      assert.throws(() => config.get('e6'), /Validation error./g);
    });

  });

  describe('hex', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'hex',
        x2: 'hex',
        x3: 'hex',
        x4: 'hex',
        e1: 'hex',
        e2: 'hex',
        e3: 'hex',
        e4: 'hex'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: '0130A1F5',
        e1: NaN,
        e2: {},
        e3: 123,
        e4: 'hello world'
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate hex string', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should not validate Number', function() {
      assert(stack.e3, 'Validation failed');
    });

    it('should not validate text', function() {
      assert(stack.e4, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse hex string', function() {
      assert.strictEqual(config.get('x3'), '0130A1F5');
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

    it('should not parse Number', function() {
      assert.throws(() => config.get('e3'), /Validation error./g);
    });

    it('should not parse text', function() {
      assert.throws(() => config.get('e4'), /Validation error./g);
    });

  });

  describe('duration', function() {

    beforeEach(function() {
      config.defineAll({
        x1: 'duration',
        x2: 'duration',
        x3: 'duration',
        x4: 'duration',
        x5: 'duration',
        x6: 'duration',
        x7: 'duration',
        x8: 'duration',
        x9: 'duration',
        x10: 'duration',
        x11: 'duration',
        x12: 'duration',
        e1: 'duration',
        e2: 'duration',
        e3: 'duration'
      });
      config.load({
        x1: null,
        x2: undefined,
        x3: '1 ms',
        x4: '1 millisecond',
        x5: '1 s',
        x6: '1 sec',
        x7: '1 second',
        x8: '1 m',
        x9: '1 min',
        x10: '1 minute',
        x11: 1500,
        x12: '1500',
        e1: NaN,
        e2: {},
        e3: 'hello world'
      });
    });

    it('should validate Null', function() {
      stack = config.validate();
      assert(!stack.x1, 'Validation failed');
    });

    it('should validate undefined', function() {
      assert(!stack.x2, 'Validation failed');
    });

    it('should validate "1 ms"', function() {
      assert(!stack.x3, 'Validation failed');
    });

    it('should validate "1 millisecond"', function() {
      assert(!stack.x4, 'Validation failed');
    });

    it('should validate "1 s"', function() {
      assert(!stack.x5, 'Validation failed');
    });

    it('should validate "1 sec"', function() {
      assert(!stack.x6, 'Validation failed');
    });

    it('should validate "1 second"', function() {
      assert(!stack.x7, 'Validation failed');
    });

    it('should validate "1 m"', function() {
      assert(!stack.x8, 'Validation failed');
    });

    it('should validate "1 min"', function() {
      assert(!stack.x9, 'Validation failed');
    });

    it('should validate "1 minute"', function() {
      assert(!stack.x10, 'Validation failed');
    });

    it('should validate Number', function() {
      assert(!stack.x11, 'Validation failed');
    });

    it('should validate Integer String', function() {
      assert(!stack.x12, 'Validation failed');
    });

    it('should not validate NaN', function() {
      assert(stack.e1, 'Validation failed');
    });

    it('should not validate Object', function() {
      assert(stack.e2, 'Validation failed');
    });

    it('should not validate text', function() {
      assert(stack.e3, 'Validation failed');
    });

    it('should parse Null', function() {
      assert.strictEqual(config.get('x1'), null);
    });

    it('should parse undefined', function() {
      assert.strictEqual(config.get('x2'), undefined);
    });

    it('should parse "1 ms"', function() {
      assert.strictEqual(config.get('x3'), 1);
    });

    it('should parse "1 millisecond"', function() {
      assert.strictEqual(config.get('x4'), 1);
    });

    it('should parse "1 s"', function() {
      assert.strictEqual(config.get('x5'), 1000);
    });

    it('should parse "1 sec"', function() {
      assert.strictEqual(config.get('x6'), 1000);
    });

    it('should parse "1 second"', function() {
      assert.strictEqual(config.get('x7'), 1000);
    });

    it('should parse "1 m"', function() {
      assert.strictEqual(config.get('x8'), 60000);
    });

    it('should parse "1 min"', function() {
      assert.strictEqual(config.get('x9'), 60000);
    });

    it('should parse "1 minute"', function() {
      assert.strictEqual(config.get('x10'), 60000);
    });

    it('should parse Number', function() {
      assert.strictEqual(config.get('x11'), 1500);
    });

    it('should parse Integer String', function() {
      assert.strictEqual(config.get('x12'), 1500);
    });

    it('should not parse NaN', function() {
      assert.throws(() => config.get('e1'), /Validation error./g);
    });

    it('should not parse Object', function() {
      assert.throws(() => config.get('e2'), /Validation error./g);
    });

    it('should not parse text', function() {
      assert.throws(() => config.get('e3'), /Validation error./g);
    });

  });

});
