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

  /**
   * Returns root node
   *
   * @return {ConfigNode}
   */
  get root() {
    return this._parent.root;
  }

  /**
   * Return parent node
   *
   * @return {ConfigNode}
   */
  get parent() {
    return this._parent;
  }

  /**
   * Returns key of this node
   *
   * @return {string}
   */
  get key() {
    return this._key;
  }

  /**
   * Returns object instance that contains child nodes
   *
   * @return {Object}
   */
  get children() {
    return this._children;
  }

  /**
   * Returns path string of this node
   *
   * @return {string}
   */
  get path() {
    return joinNodePath(this.parent && this.parent.path, this.key);
  }

  /**
   * Returns only loaded configuration values. Values does not contains environment and process arguments
   *
   * @return {Object}
   */
  get loadedValues() {
    const values = this.parent.loadedValues;
    return values && values[this.key];
  }

  /**
   * Returns documentation of this node
   *
   * @return {string}
   */
  get doc() {
    return this._doc;
  }

  /**
   * Sets documentation of this node
   *
   * @param value
   */
  set doc(value) {
    this._doc = value ? String(value) : null;
  }

  /**
   * Adds child node
   *
   * @param {String} key
   * @param {Object} [def]
   * @return {ConfigNode}
   */
  addChild(key, def) {
    return (this._children[key] = new ConfigNode(this, key, def));
  }

  /**
   * Returns child node of given key relative to this node
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
   * Defines new item to schema relative to this node
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
   * Defines set of items to schema
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

  /**
   * Returns schema relative to this node
   *
   * @return {*}
   */
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
   * Returns default value of given key
   *
   * @param {String} key
   * @param {Boolean} [original]
   * @return {*}
   */
  default(key, original) {
    const n = this._getNode(key);
    const sch = (n && n.node._schema[n.key]);
    if (!sch)
      throw new ErrorEx('Property "%s" is not defined', key);
    if (original)
      return sch.default;
    const format = this._findFormat(sch.default, sch, key);
    if (Array.isArray(format))
      return sch.default;
    return format.parse ? format.parse(sch.default) :
        /* istanbul ignore next */ sch.default;
  }

  /**
   * Returns value of given key
   *
   * @param {String} key
   * @param {Boolean} [original]
   * @return {*}
   */
  get(key, original) {
    const n = this._getNode(key);
    const sch = (n && n.node._schema[n.key]);
    if (!sch)
      throw new ErrorEx('Property "%s" is not defined', key);

    // 1. Use value which set in app
    let v = sch.value;
    // 2. Use value from process argvs
    if (v === undefined && sch.arg)
      v = process_args[sch.arg];
    // 3. Use value from environment variables
    if (v === undefined && sch.env)
      v = process.env[sch.env];
    // 4. Use value from loaded config objects and files
    if (v === undefined) {
      const values = n.node.loadedValues;
      v = values && values[n.key];
    }
    // 5. Use default value
    if (v === undefined)
      return n.node.default(n.key, original);

    if (original)
      return v;
    const format = this._findFormat(v, sch, key);
    if (Array.isArray(format))
      return v;
    return format.parse ? format.parse(v) :
        /* istanbul ignore next */ v;
  }

  /**
   * Sets value for given key
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
   * Resets value of given key to default
   *
   * @param {string} key
   */
  reset(key) {
    this.set(key, undefined);
  }

  /**
   * Checks if key exists
   *
   * @param {string} key
   * @return {boolean}
   */
  has(key) {
    const n = this._getNode(key);
    return !!(n.node._schema[n.key]);
  }

  /**
   * Returns whole values as object
   *
   */
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
   * Validates values.
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

  /**
   * Returns root node
   *
   * @return {ConfigNode}
   */
  get root() {
    return this;
  }

  /**
   * Returns only loaded configuration values. Values does not contains environment and process arguments
   *
   * @return {Object}
   */
  get loadedValues() {
    return this._values;
  }

  /**
   * Adds new format type
   *
   * @param {Object} def
   * @return {Configuration}
   */
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

  /**
   * Adds new parser for given file extension
   *
   * @param {string} ext
   * @param {Function|Array<Function>} parser
   * @return {Configuration}
   */
  addParser(ext, parser) {
    this._parsers[ext] = parser;
    return this;
  }

  /**
   * Adds many parsers at same time
   *
   * @param {Object} parsers
   * @return {Configuration}
   */
  addParsers(parsers) {
    /* istanbul ignore next */
    for (const ext of Object.keys(parsers))
      this.addParser(ext, parsers[ext]);
    return this;
  }

  /**
   * Loads configuration values from object
   *
   * @param {Object} obj
   * @return {Configuration}
   */
  load(obj) {
    merge.deep(this._values, obj);
    return this;
  }

  /**
   * Loads configuration values from file
   *
   * @param {string} file
   * @param {string} [ext]
   * @return {Configuration}
   */
  loadFile(file, ext) {
    ext = ext || path.extname(file).replace(/\./, '');
    const parser = this._parsers[ext];
    /* istanbul ignore next */
    if (!parser)
      throw new ErrorEx('No parser registered for file format (%s)', ext);

    const str = fs.readFileSync(file);
    let o;
    /* istanbul ignore next */
    if (!str)
      return this;
    const parsers = Array.isArray(parser) ? parser : [parser];
    for (const parser of parsers) {
      try {
        o = parser(str);
        if (o && typeof o === 'object') {
          this.load(o);
          return this;
        }
      } catch (ignore) {
        // ignore
      }
    }
    throw new ErrorEx('Registered parsers couldn\t parse file "%s"', file);
  }

  /**
   * Loads configuration values from file array
   *
   * @param {Array<string>} files
   * @return {Configuration}
   */
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
