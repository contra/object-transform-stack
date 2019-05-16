'use strict';

exports.__esModule = true;
exports.transform = undefined;

var _dotProp = require('dot-prop');

var _dotProp2 = _interopRequireDefault(_dotProp);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _getTypes = require('./getTypes');

var _getTypes2 = _interopRequireDefault(_getTypes);

var _types = require('./presets/types');

var typeDefs = _interopRequireWildcard(_types);

var _transforms = require('./presets/transforms');

var transformDefs = _interopRequireWildcard(_transforms);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const isValueObject = v => (0, _isPlainObject2.default)(v) && (v.field || v.transform);

const validateArgumentTypes = (transform, sig, arg, types) => {
  if (sig.types === 'any') return true; // allows anything
  const argTypes = (0, _getTypes2.default)(arg, types);
  const typesValid = argTypes.some(t => sig.types.includes(t));
  if (!typesValid) throw new Error(`Argument "${sig.name}" for "${transform.name}" must be of type: ${sig.types.join(', ')}, instead got ${argTypes.join(', ')}`);
  return true;
};

const resolveTransform = (value, inp, opt) => {
  const transform = opt.transforms[value.transform];
  if (!transform || typeof transform.execute !== 'function') {
    throw new Error(`Invalid transform: ${value.transform}`);
  }
  const resolvedArgs = value.arguments ? value.arguments.map(a => isValueObject(a) ? resolveFrom(a, inp, opt) : a) : [];

  let skip = false;
  if (transform.signature) {
    transform.signature.forEach((sig, idx) => {
      const arg = resolvedArgs[idx];
      // if any required arg is missing, transform returns undefined
      if (sig.required && arg == null) {
        skip = true;
        return;
      }
      validateArgumentTypes(transform, sig, arg, opt.types);
    });
  }
  if (transform.splat) {
    const existingArgs = resolvedArgs.filter(v => v != null);
    // if number of required args not present, transform returns undefined
    if (transform.splat.required > existingArgs.length) {
      skip = true;
    }
    value.arguments.forEach(arg => {
      validateArgumentTypes(transform, transform.splat, arg, opt.types);
    });
  }
  return skip ? undefined : transform.execute(...resolvedArgs);
};

const resolveFrom = (value, inp, opt) => {
  let v = isValueObject(value) ? value.transform ? resolveTransform(value, inp, opt) : _dotProp2.default.get(inp, value.field) : value;

  if (v == null && typeof value.defaultValue !== 'undefined') v = value.defaultValue;
  if (opt.strict && typeof v === 'undefined') v = null;
  return v;
};

const transform = exports.transform = (stack, inp, { strict, transforms = transformDefs, types = typeDefs } = {}) => {
  if (!Array.isArray(stack)) throw new Error('Missing stack argument!');
  if (inp == null || typeof inp !== 'object') return {}; // short out on invalid input
  return stack.reduce((prev, op) => {
    _dotProp2.default.set(prev, op.to, resolveFrom(op.from, inp, { strict, transforms, types }));
    return prev;
  }, {});
};