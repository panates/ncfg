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
const internalFormats = require('./formats');

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

  get values() {
    return this.parent.values[this.key];
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
    if (def.default !== undefined)
      o.default = def.default;
    if (def.doc)
      o.doc = def.doc;
    if (def.env)
      o.env = def.env;
    if (def.arg)
      o.arg = def.arg;
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
    const process = (node, target) => {
      merge.deep(target, node._schema);
      for (const k of Object.keys(node.children)) {
        const n = node.children[k];
        const v = target[k] = {};
        /* istanbul ignore else */
        if (n.doc)
          v.doc = n.doc;
        v.properties = {};
        process(n, v.properties);
      }
      return target;
    };
    return process(this, {});
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

    const values = n.node.values;
    const v = values && values[n.key];
    if (v === undefined)
      return n.node.default(n.key);
    return this._parseValue(v, sch, key);
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

    let values = n.node.values;
    if (!values) {
      const a = String(joinNodePath(this.path, key)).split(/\./);
      a.pop();
      values = this.root.values;
      while (a.length) {
        const m = a.shift();
        values[m] = values[m] || {};
        values = values[m];
      }
    }
    values[n.key] = this._parseValue(value, sch, key);
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
    const process = (node, target) => {
      for (const key of Object.keys(node._schema)) {
        const v = node.get(key);
        if (v !== undefined)
          target[key] = v;
      }
      for (const key of Object.keys(node._children)) {
        const child = node._children[key];
        target[key] = {};
        process(child, target[key]);
      }
    };
    process(this, result);
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

    const process = (node, values, list) => {
      for (const key of Object.keys(node._children)) {
        const stk = options.flat ? list :
            (list[key] = {});
        process(this._children[key], values[key], stk);
      }

      for (const key of Object.keys(node._schema)) {
        const sch = node._schema[key];
        const v = values && values[key];
        const nodepath = joinNodePath(node.path, key);

        try {
          this._parseValue(v, sch, nodepath);
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
    process(this, this.values, list);
  }

  _parseValue(value, sch, key) {
    if (Array.isArray(sch.format)) {
      if (value == null || sch.format.includes(value))
        return true;
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
        return x.parse ? x.parse(value) :
            /* istanbul ignore next */ value;
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

  get values() {
    return this._values;
  }

  addFormat(def) {
    if (typeof def !== 'object')
      throw new ArgumentError('You must provide Object instance as first argument');
    if (!def.name)
      throw new ArgumentError('You must provide "name" property');

    this._customFormats[def.name] = {
      validate: def.validate,
      coerce: def.coerce || def.parse
    };
  }

  addParser(ext, parse) {
    this._parsers[ext] = parse;
  }

  addParsers(parsers) {
    /* istanbul ignore next */
    parsers = Array.isArray(parsers) ? parsers : [parsers];
    for (const parser of parsers)
      this.addParser(parser.ext, parser.parse);
  }

  load(obj) {
    merge.deep(this._values, obj);
  }

  loadFile(file, ext) {
    ext = ext || path.extname(file).replace(/\./, '');
    const parser = this._parsers[ext];
    /* istanbul ignore next */
    if (!parser)
      throw new ErrorEx('No parser registered for file format (%s)', ext);
    this.load(parser(fs.readFileSync(file)));
  }

  loadFiles(files) {
    files = Array.isArray(files) ? files : [files];
    for (const file of files) {
      this.loadFile(file);
    }
  }

}

function joinNodePath(parent, key) {
  return key ? (parent ? parent + '.' : '') + key : '';
}

/**
 * Expose `Configuration`.
 */
module.exports = Configuration;
