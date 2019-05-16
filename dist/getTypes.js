'use strict';

exports.__esModule = true;

var _lodash = require('lodash.sortby');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (v, types) => (0, _lodash2.default)(Object.entries(types).reduce((prev, [type, fn]) => {
  if (!fn || typeof fn.check !== 'function') return prev;
  if (fn.check(v)) prev.push(type);
  return prev;
}, []));

module.exports = exports.default;