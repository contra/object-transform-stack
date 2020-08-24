"use strict";

exports.__esModule = true;
exports.default = void 0;

var _lodash = require("lodash");

var _default = (v, types) => (0, _lodash.sortBy)(Object.entries(types).reduce((prev, [type, fn]) => {
  if (!fn || typeof fn.check !== 'function') return prev;
  if (fn.check(v)) prev.push(type);
  return prev;
}, []));

exports.default = _default;
module.exports = exports.default;