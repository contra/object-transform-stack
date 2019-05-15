'use strict';

exports.__esModule = true;
exports.analyze = exports.paths = undefined;

var _lodash = require('lodash.foreach');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.mergewith');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.union');

var _lodash6 = _interopRequireDefault(_lodash5);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _getTypes = require('./getTypes');

var _getTypes2 = _interopRequireDefault(_getTypes);

var _types = require('./presets/types');

var typeDefs = _interopRequireWildcard(_types);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getPaths = o => {
  const out = {};
  const visit = (obj, keys = []) => {
    (0, _lodash2.default)(obj, (v, key) => {
      keys.push(String(key).replace(/\./g, '\\.'));
      out[keys.join('.')] = v;
      if (Array.isArray(v) || (0, _isPlainObject2.default)(v)) visit(v, keys);
      keys.pop();
    });
  };
  visit(o);
  return out;
};

const paths = exports.paths = (inp, { types = typeDefs } = {}) => {
  const paths = getPaths(inp);
  return Object.entries(paths).reduce((prev, [path, v]) => {
    prev.push({
      path,
      types: (0, _getTypes2.default)(v, types)
    });
    return prev;
  }, []);
};

const analyze = exports.analyze = (inp, { types = typeDefs } = {}) => {
  const getPathsAndTypes = i => {
    const paths = getPaths(i);
    return Object.entries(paths).reduce((prev, [path, v]) => {
      prev[path] = (0, _getTypes2.default)(v, types);
      return prev;
    }, {});
  };
  const merger = (prev, src) => (0, _lodash6.default)(prev, src);
  const all = (0, _lodash4.default)(...inp.map(getPathsAndTypes), merger);
  return Object.entries(all).map(([path, types]) => ({
    path,
    types
  }));
};