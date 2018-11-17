/*
 ------------------------
 (c) 2017-present Panates
 SQB may be freely distributed under the MIT license.
 */

/**
 * Module dependencies.
 * @private
 */
const errorex = require('errorex');
const {ErrorEx} = errorex;

class SchemaError extends ErrorEx {
}

class ValidationError extends ErrorEx {
}

module.exports = Object.assign({}, errorex);

module.exports.SchemaError = SchemaError;
module.exports.ValidationError = ValidationError;
