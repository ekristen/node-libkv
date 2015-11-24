'use strict';

module.exports = function ErrorNotFound(message, code) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message || 'Not Found';
  this.status = code || 404;
};

require('util').inherits(module.exports, Error);
