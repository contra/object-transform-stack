'use strict';

exports.__esModule = true;

exports.default = (v, types) => Object.entries(types).reduce((prev, [type, fn]) => {
  if (!fn || typeof fn.check !== 'function') return prev;
  if (fn.check(v)) prev.push(type);
  return prev;
}, []);

module.exports = exports.default;