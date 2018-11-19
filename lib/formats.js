/*
 ------------------------
 (c) 2017-present Panates
 SQB may be freely distributed under the MIT license.
 */

/**
 * Module dependencies.
 * @private
 */
const validator = require('validator');
const moment = require('moment');

const DURATION_PATTERN = /^(\d+) *(?:(ms|millisecond|s|sec|second|min|m|minute|h|hour|d|day|w|week|M|month|y|year)s?)?$/;

module.exports = {

  'string': {
    parse: (value) => parseString(value),
    validate: (value) => value == null ||
        typeof value === 'string' ||
        (typeof value === 'number' && !isNaN(value))
  },

  'number': {
    parse: (value) => value == null ? undefornull(value) : parseFloat(value),
    validate: (value) => value == null || isNumeric(value)
  },

  'int': {
    parse: (value) => value == null ? undefornull(value) : parseInt(value, 10),
    validate: (value) => value == null || Number.isInteger(parseFloat(value))
  },

  'natnum': {
    parse: (value) =>
        value == null ? undefornull(value) : parseInt(value, 10),
    validate: (value) =>
        value == null ||
        (Number.isInteger(parseFloat(value)) && parseInt(value, 10) >= 0)
  },

  'posnum': {
    parse: (value) =>
        value == null ? undefornull(value) : parseFloat(value),
    validate: (value) =>
        value == null || (isNumeric(value) && parseFloat(value) >= 0)
  },

  'url': {
    parse: (value) => parseString(value),
    validate: (value) =>
        value == null || validator.isURL(value, {require_tld: false})
  },

  'ip': {
    parse: (value) => parseString(value),
    validate: (value) => value == null || validator.isIP(value)
  },

  'port': {
    parse: (value) => value == null ? undefornull(value) :
        parseInt(value, 10),
    validate: (value) => value == null || isPort(value)
  },

  'wnp': {
    parse: (value) => parseString(value),
    validate: (value) => value == null || isWindowsNamedPipe(value)
  },

  'email': {
    parse: (value) => parseString(value),
    validate: (value) => value == null || validator.isEmail(value)
  },

  'uuid': {
    parse: (value) => parseString(value),
    validate: (value) => value == null || validator.isUUID(value)
  },

  'uuid3': {
    parse: (value) => parseString(value),
    validate: (value) => value == null || validator.isUUID(value, 3)
  },

  'uuid4': {
    parse: (value) => parseString(value),
    validate: (value) => value == null || validator.isUUID(value, 4)
  },

  'uuid5': {
    parse: (value) => parseString(value),
    validate: (value) => value == null || validator.isUUID(value, 5)
  },

  'hex': {
    parse: (value) => parseString(value),
    validate: (value) => value == null || validator.isHexadecimal(value)
  },

  'duration': {
    parse: (value) => parseDuration(value),
    validate: (value) => {
      value = parseDuration(value);
      return value == null || Number.isInteger(value);
    }
  }

};

function undefornull(n) {
  return n === undefined ? undefined : null;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isPort(n) {
  n = parseInt(n, 10);
  return Number.isInteger(n) && n >= 0 && n <= 65535;
}

function parseString(n) {
  if (n == null || (typeof n === 'number' && isNaN(n)))
    return undefornull(n);
  return String(n);
}

function parseDuration(v) {
  if (v == null)
    return undefornull(v);
  if (Number.isInteger(v))
    return parseInt(v);
  const m = String(v).match(DURATION_PATTERN);
  if (!m)
    return NaN;
  if (m[2] === 'sec')
    m[2] = 'seconds';
  if (m[2] === 'min')
    m[2] = 'minute';
  return moment.duration(parseInt(m[1], 10), m[2] || 'ms').valueOf();
}

/**
 * Checks if x is a windows named pipe
 *
 * @see https://msdn.microsoft.com/en-us/library/windows/desktop/aa365783(v=vs.85).aspx
 * @param {String} x
 * @returns {Boolean}
 */
function isWindowsNamedPipe(x) {
  return !!(x && String(x).startsWith('\\\\.\\pipe\\'));
}
