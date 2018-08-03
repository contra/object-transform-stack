'use strict';

exports.__esModule = true;
exports.pathsAggregate = exports.paths = exports.transform = undefined;

var _dotProp = require('dot-prop');

var _dotProp2 = _interopRequireDefault(_dotProp);

var _lodash = require('lodash.foreach');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.mergewith');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.union');

var _lodash6 = _interopRequireDefault(_lodash5);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _types = require('./types');

var typeDefs = _interopRequireWildcard(_types);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// transform stuff
const applyTransforms = (op, v, transforms = {}) => {
  if (!Array.isArray(op.transforms)) return v;
  return op.transforms.reduce((prev, k) => {
    const fn = transforms[k];
    if (typeof fn !== 'function') throw new Error(`Invalid transform: ${k}`);
    return fn(prev);
  }, v);
};

const transform = exports.transform = (stack, inp, { strict, transforms } = {}) => {
  if (!Array.isArray(stack)) throw new Error('Missing stack argument!');
  if (inp == null || typeof inp !== 'object') return {}; // short out on invalid input

  return stack.reduce((prev, op) => {
    let v = _dotProp2.default.get(inp, op.from);
    if (typeof op.defaultValue !== 'undefined') v = op.defaultValue;
    if (typeof v === 'undefined') {
      // if strict, use null
      // otherwise use undefined
      v = strict ? null : v;
    } else {
      v = applyTransforms(op, v, transforms);
    }
    _dotProp2.default.set(prev, op.to, v);
    return prev;
  }, {});
};

// path stuff
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
const getTypes = (v, types) => Object.keys(types).reduce((prev, type) => {
  const fn = types[type];
  if (typeof fn !== 'function') return prev;
  if (fn(v)) prev.push(type);
  return prev;
}, []);

const paths = exports.paths = (inp, { types = typeDefs } = {}) => {
  const paths = getPaths(inp);
  return Object.keys(paths).reduce((prev, path) => {
    const v = paths[path];
    prev.push({
      path,
      types: getTypes(v, types)
    });
    return prev;
  }, []);
};

const pathsAggregate = exports.pathsAggregate = (inp, { types = typeDefs } = {}) => {
  const merger = (prev, src) => {
    if (typeof prev === 'undefined') return getTypes(src, types);
    return (0, _lodash6.default)(Array.isArray(prev) ? prev : getTypes(prev, types), Array.isArray(src) ? src : getTypes(src, types));
  };
  const all = (0, _lodash4.default)(...inp.map(getPaths), merger);
  return Object.keys(all).map(path => ({
    path,
    types: Array.isArray(all[path]) ? all[path] : getTypes(all[path], types) // mergeWith doesnt touch all keys, so pick up any stragglers here
  }));
};