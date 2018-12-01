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
const BYTESIZE_PATTERN = /^(\d+) *(?:(b|kb|mb|gb|tb)s?)?$/i;

module.exports = {

  'boolean': {
    name: 'boolean',
    parse: (v) => v == null ? undefornull(v) : perseBoolean(v),
    validate: (v) => v == null || perseBoolean(v) != null
  },

  'string': {
    name: 'string',
    parse: (v) => parseString(v),
    validate: (v) => v == null || typeof v === 'string' ||
        (typeof v === 'number' && !isNaN(v))
  },

  'number': {
    name: 'number',
    parse: (v) => v == null ? undefornull(v) : parseFloat(v),
    validate: (v) => v == null || isNumeric(v)
  },

  'int': {
    name: 'integer',
    parse: (v) => v == null ? undefornull(v) : parseInt(v, 10),
    validate: (v) => v == null || Number.isInteger(parseFloat(v))
  },

  'natnum': {
    name: 'natural number',
    parse: (v) =>
        v == null ? undefornull(v) : parseInt(v, 10),
    validate: (v) =>
        v == null ||
        (Number.isInteger(parseFloat(v)) && parseInt(v, 10) >= 0)
  },

  'posnum': {
    name: 'positive number',
    parse: (v) =>
        v == null ? undefornull(v) : parseFloat(v),
    validate: (v) =>
        v == null || (isNumeric(v) && parseFloat(v) >= 0)
  },

  'url': {
    name: 'url',
    parse: (v) => parseString(v),
    validate: (v) => isEmptyString(v) ||
        validator.isURL(v, {require_tld: false})
  },

  'ip': {
    name: 'ip address',
    parse: (v) => parseString(v),
    validate: (v) => isEmptyString(v) || validator.isIP(v)
  },

  'port': {
    name: 'port number',
    parse: (v) => v == null ? undefornull(v) :
        parseInt(v, 10),
    validate: (v) => v == null || isPort(v)
  },

  'wnp': {
    name: 'windows named pipe',
    parse: (v) => parseString(v),
    validate: (v) => isEmptyString(v) || isWindowsNamedPipe(v)
  },

  'email': {
    name: 'e-mail',
    parse: (v) => parseString(v),
    validate: (v) => isEmptyString(v) || validator.isEmail(v)
  },

  'uuid': {
    name: 'uuid',
    parse: (v) => parseString(v),
    validate: (v) => isEmptyString(v) || validator.isUUID(v)
  },

  'uuid3': {
    name: 'uuid v3',
    parse: (v) => parseString(v),
    validate: (v) => isEmptyString(v) || validator.isUUID(v, 3)
  },

  'uuid4': {
    name: 'uuid v4',
    parse: (v) => parseString(v),
    validate: (v) => isEmptyString(v) || validator.isUUID(v, 4)
  },

  'uuid5': {
    name: 'uuid v5',
    parse: (v) => parseString(v),
    validate: (v) => isEmptyString(v) || validator.isUUID(v, 5)
  },

  'hex': {
    name: 'hex',
    parse: (v) => parseString(v),
    validate: (v) => isEmptyString(v) || validator.isHexadecimal(v)
  },

  'duration': {
    name: 'duration',
    parse: (v) => parseDuration(v),
    validate: (v) => isEmptyString(v) || Number.isInteger(parseDuration(v))
  },

  'bytesize': {
    name: 'byte size',
    parse: (v) => parseBytesize(v),
    validate: (v) => isEmptyString(v) || Number.isInteger(parseBytesize(v))
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

function isEmptyString(v) {
  return v == null || v === '';
}

function perseBoolean(n) {
  if (n == null || typeof n === 'boolean')
    return n;
  if (Number.isInteger(n))
    return !!n;
  if (['true', '1', 't', 'yes', 'y'].includes(String(n).toLowerCase()))
    return true;
  if (['false', '0', 'f', 'no', 'n'].includes(String(n).toLowerCase()))
    return false;
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

function parseBytesize(v) {
  if (v == null)
    return undefornull(v);
  if (Number.isInteger(v))
    return parseInt(v);
  const m = String(v).match(BYTESIZE_PATTERN);
  v = parseInt(m[1]);
  switch ((m[2] || '').toLowerCase()) {
    case 'kb':
      v *= 1024;
      break;
    case 'mb':
      v *= Math.pow(1024, 2);
      break;
    case 'gb':
      v *= Math.pow(1024, 3);
      break;
    case 'tb':
      v *= Math.pow(1024, 4);
      break;
  }
  return v;
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
