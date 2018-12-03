/*
 ------------------------
 (c) 2017-present Panates
 SQB may be freely distributed under the MIT license.
 */

/**
 * Module dependencies.
 * @private
 */
const {SchemaError, ValidationError} = require('./errors');
const Configuration = require('./Configuration');
module.exports = function() {
  return new Configuration();
};

Object.assign(module.exports, {
  Configuration,
  SchemaError,
  ValidationError
});

