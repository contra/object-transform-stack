'use strict';

exports.__esModule = true;
exports.transform = undefined;

var _dotProp = require('dot-prop');

var _dotProp2 = _interopRequireDefault(_dotProp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    const v = _dotProp2.default.get(inp, op.from, op.defaultValue);
    // if strict, use null
    // otherwise use undefined
    const actual = typeof v === 'undefined' ? strict ? null : v : applyTransforms(op, v, transforms);
    _dotProp2.default.set(prev, op.to, actual);
    return prev;
  }, {});
};