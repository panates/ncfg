/*
 ------------------------
 (c) 2017-present Panates
 All rights reserved
*/

/**
 * Module dependencies.
 * @private
 */

const merge = require('putil-merge');
const {ErrorEx, ArgumentError, SchemaError, ValidationError} = require('./errors');
const path = require('path');
const fs = require('fs');
const parseArgs = require('yargs-parser');
const internalFormats = require('./formats');

const process_args = parseArgs(process.argv, {
  configuration: {
    'dot-notation': false
  }
});

/**
 * @class
 */
class ConfigNode {

  /**
   * @param {ConfigNode} parent
   * @param {string} key
   * @param {Object} [options]
   */
  constructor(parent, key, options) {
    this._parent = parent;
    this._key = key;
    this._children = {};
    this._schema = {};
    this.doc = options && options.doc;
    if (options && options.properties)
      this.defineAll(options.properties);
  }

  get root() {
    return this._parent.root;
  }

  get parent() {
    return this._parent;
  }

  get key() {
    return this._key;
  }

  get children() {
    return this._children;
  }

  get path() {
    return joinNodePath(this.parent && this.parent.path, this.key);
  }

  get loadedValues() {
    const values = this.parent.loadedValues;
    return values && values[this.key];
  }

  get doc() {
    return this._doc;
  }

  set doc(value) {
    this._doc = value ? String(value) : null;
  }

  /**
   *
   * @param {String} key
   * @param {Object} [def]
   * @return {ConfigNode}
   */
  addChild(key, def) {
    return (this._children[key] = new ConfigNode(this, key, def));
  }

  /**
   *
   * @param {String} key
   * @return {ConfigNode}
   */
  getChild(key) {
    if (!key)
      return;
    const a = String(key).split(/\./);
    let n = this;
    while (n && a.length)
      n = n._children[a.shift()];
    return n;
  }

  /**
   *
   * @param {String} key
   * @param {Object} def
   * @return {ConfigNode}
   */
  define(key, def) {
    if (typeof key !== 'string')
      throw new ArgumentError('You must provide String instance as first argument');
    if (typeof def === 'string')
      def = {format: def};
    if (typeof def !== 'object')
      throw new ArgumentError('You must provide Object instance as second argument');
    if (!def.format)
      throw new ArgumentError('You must provide "format" property');
    if (!Array.isArray(def.format)) {
      const formats = def.format.split('|');
      for (const format of formats) {
        if (!(this.root._customFormats[format] ||
            internalFormats[String(format).toLowerCase()]))
          throw new ArgumentError('No such format defined (%s)', format);
      }
    }

    const o = this._schema[key] = {
      format: def.format
    };
    if (def.doc)
      o.doc = def.doc;
    if (def.env)
      o.env = def.env;
    if (def.arg)
      o.arg = def.arg;
    if (def.default !== undefined && this._findFormat(def.default, o, key))
      o.default = def.default;
    return this;
  }

  /**
   *
   * @param {Object} defs
   * @return {ConfigNode}
   */
  defineAll(defs) {
    if (typeof defs !== 'object')
      throw new ArgumentError('You must provide Object instance as first argument');
    for (const k of Object.keys(defs)) {
      let o = defs[k];
      if (typeof o === 'string')
        o = {format: o};
      /* istanbul ignore next */
      if (o.format && o.properties)
        throw new SchemaError('You can set one of the "format" or "properties" properties, not both');
      if (o.format) {
        this.define(k, o);
        continue;
      }
      /* istanbul ignore else */
      if (o.properties) {
        this.addChild(k, o);
        continue;
      }
      /* istanbul ignore next */
      throw new SchemaError('One of the "format" or "properties" properties must be set');
    }
    return this;
  }

  getSchema() {
    const iterate = (node, target) => {
      merge.deep(target, node._schema);
      for (const k of Object.keys(node.children)) {
        const n = node.children[k];
        const v = target[k] = {};
        /* istanbul ignore else */
        if (n.doc)
          v.doc = n.doc;
        v.properties = {};
        iterate(n, v.properties);
      }
      return target;
    };
    return iterate(this, {});
  }

  /**
   *
   * @param {String} key
   * @return {*}
   */
  get(key) {
    const n = this._getNode(key);
    const sch = (n && n.node._schema[n.key]);
    if (!sch)
      throw new ErrorEx('Property "%s" is not defined', key);

    if (sch.value !== undefined)
      return sch.value;

    if (sch.arg && process_args[sch.arg] !== undefined)
      return process_args[sch.arg];

    if (sch.env && process.env[sch.env] !== undefined)
      return process.env[sch.env];

    const values = n.node.loadedValues;
    const v = values && values[n.key];
    if (v === undefined)
      return n.node.default(n.key);
    const format = this._findFormat(v, sch, key);
    if (Array.isArray(format))
      return v;
    return format.parse ? format.parse(v) :
        /* istanbul ignore next */ v;
  }

  /**
   *
   * @param {String} key
   * @param {*} value
   * @return {ConfigNode}
   */
  set(key, value) {
    const n = this._getNode(key);
    const sch = (n && n.node._schema[n.key]);
    if (!sch)
      throw new ErrorEx('Property "%s" is not defined', key);

    if (value === undefined)
      delete sch.value;
    else {
      this._findFormat(value, sch, key); // Validate value
      sch.value = value;
    }
    return this;
  }

  /**
   *
   * @param {String} key
   * @return {*}
   */
  default(key) {
    const n = this._getNode(key);
    const sch = (n && n.node._schema[n.key]);
    if (!sch)
      throw new ErrorEx('Property "%s" is not defined', key);
    return sch.default;
  }

  reset(key) {
    this.set(key, undefined);
  }

  has(key) {
    const n = this._getNode(key);
    return !!(n.node._schema[n.key]);
  }

  toJSON() {
    const result = {};
    const iterate = (node, target) => {
      for (const key of Object.keys(node._schema)) {
        const v = node.get(key);
        if (v !== undefined)
          target[key] = v;
      }
      for (const key of Object.keys(node._children)) {
        const child = node._children[key];
        target[key] = {};
        iterate(child, target[key]);
      }
    };
    iterate(this, result);
    return result;
  }

  /**
   *
   * @param {Object} [options]
   * @param {Boolean} [options.bail]
   * @param {Boolean} [options.flat]
   * @return {Object}
   */
  validate(options) {
    options = options || {};
    const list = {};
    this._validate(options, list);
    return list;
  }

  /**
   *
   * @param {Object} [options]
   * @param {Object} [options.bail]
   * @param {Boolean} [options.flat]
   * @param {Object} list
   */
  _validate(options, list) {

    const iterate = (node, values, list) => {
      for (const key of Object.keys(node._children)) {
        const stk = options.flat ? list :
            (list[key] = {});
        iterate(this._children[key], values[key], stk);
      }

      for (const key of Object.keys(node._schema)) {
        const sch = node._schema[key];
        const v = values && values[key];
        const nodepath = joinNodePath(node.path, key);

        try {
          this._findFormat(v, sch, nodepath);
        } catch (e) {
          e.path = nodepath;
          if (options.bail)
            throw e;
          if (options.flat)
            list[joinNodePath(node.path, key)] = e;
          else list[key] = e;
        }
      }
    };
    iterate(this, this._values, list);
  }

  _findFormat(value, sch, key) {
    if (Array.isArray(sch.format)) {
      if (value == null || sch.format.includes(value))
        return sch.format;
      throw new ValidationError(
          'Validation error for "%s" property. "%s" is not one of "%s" enum values.',
          key, value, sch.format);
    }

    const formats = sch.format.split('|');
    let msg;
    for (const format of formats) {
      const x = this.root._customFormats[format] ||
          internalFormats[String(format).toLowerCase()];
      let valid = true;
      /* istanbul ignore else */
      if (x.validate) {
        try {
          valid = x.validate(value, key);
        } catch (e) {
          valid = false;
          msg = e.message;
        }
      }
      if (valid)
        return x;
    }
    throw new ValidationError('Validation error for "%s" property.' +
        (formats.length > 1 ?
            '" does not matches one of "' + formats + '" formats' :
            (msg || '"' + value + '" does not matches "' + sch.format +
                '" format')), key);
  }

  _getNode(key) {
    if (!key)
      throw new ArgumentError('You must provide "key" argument');
    const m = key.match(/(?:(.+)\.)?(.+)/);
    const node = this.getChild(m[1]);
    return {
      node: node || this,
      key: m[2]
    };
  }

}

/**
 * @class
 * @extends ConfigNode
 */
class Configuration extends ConfigNode {

  /**
   *
   * @override
   */
  constructor() {
    super(null, null);
    this._values = {};
    this._customFormats = {};
    this._parsers = {
      json: JSON.parse
    };
  }

  get root() {
    return this;
  }

  get loadedValues() {
    return this._values;
  }

  addFormat(def) {
    if (typeof def !== 'object')
      throw new ArgumentError('You must provide Object instance as first argument');
    if (!def.name)
      throw new ArgumentError('You must provide "name" property');

    this._customFormats[def.name] = {
      parse: def.parse,
      validate: def.validate
    };
    return this;
  }

  addParser(ext, parse) {
    this._parsers[ext] = parse;
    return this;
  }

  addParsers(parsers) {
    /* istanbul ignore next */
    parsers = Array.isArray(parsers) ? parsers : [parsers];
    for (const parser of parsers)
      this.addParser(parser.ext, parser.parse);
    return this;
  }

  load(obj) {
    merge.deep(this._values, obj);
    return this;
  }

  loadFile(file, ext) {
    ext = ext || path.extname(file).replace(/\./, '');
    const parser = this._parsers[ext];
    /* istanbul ignore next */
    if (!parser)
      throw new ErrorEx('No parser registered for file format (%s)', ext);
    this.load(parser(fs.readFileSync(file)));
    return this;
  }

  loadFiles(files) {
    files = Array.isArray(files) ? files : [files];
    for (const file of files) {
      this.loadFile(file);
    }
    return this;
  }

}

function joinNodePath(parent, key) {
  return key ? (parent ? parent + '.' : '') + key : '';
}

/**
 * Expose `Configuration`.
 */
module.exports = Configuration;
