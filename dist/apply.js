"use strict";

exports.__esModule = true;
exports.transform = void 0;

var _dotProp = _interopRequireDefault(require("dot-prop"));

var _isPlainObj = _interopRequireDefault(require("is-plain-obj"));

var _getTypes = _interopRequireDefault(require("./getTypes"));

var typeDefs = _interopRequireWildcard(require("./presets/types"));

var transformDefs = _interopRequireWildcard(require("./presets/transforms"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const isValueObject = v => (0, _isPlainObj.default)(v) && (v.field || v.transform);

const validateArgumentTypes = (transform, sig, arg, types) => {
  if (sig.types === 'any') return true; // allows anything

  if (!sig.required && arg == null) return true; // not present, so has a default

  if (sig.required && arg == null) throw new Error(`Argument "${sig.name}" for "${transform.name}" is required`);
  const argTypes = (0, _getTypes.default)(arg, types);
  const typesValid = argTypes.some(t => sig.types.includes(t));
  if (!typesValid) throw new Error(`Argument "${sig.name}" for "${transform.name}" must be of type: ${sig.types.join(', ')}, instead got ${argTypes.join(', ')}`);
  return true;
};

const resolveTransform = async (value, inp, opt) => {
  const transform = opt.transforms[value.transform];

  if (!transform || typeof transform.execute !== 'function') {
    throw new Error(`Invalid transform: ${value.transform}`);
  }

  const resolvedArgs = value.arguments ? await Promise.all(value.arguments.map(async (a) => isValueObject(a) ? resolveFrom(a, inp, opt) : a)) : [];
  let skip = false;

  if (transform.signature) {
    transform.signature.forEach((sig, idx) => {
      const arg = resolvedArgs[idx]; // if any required arg is missing, transform returns undefined

      if (sig.required && arg == null) {
        skip = true;
        return;
      }

      validateArgumentTypes(transform, sig, arg, opt.types);
    });
  }

  if (transform.splat) {
    const existingArgs = resolvedArgs.filter(v => v != null); // if number of required args not present, transform returns undefined

    if (transform.splat.required > existingArgs.length) {
      skip = true;
    }

    existingArgs.forEach(arg => {
      validateArgumentTypes(transform, transform.splat, arg, opt.types);
    });
  }

  return skip ? undefined : transform.execute(...resolvedArgs);
};

const resolveFrom = async (value, inp, opt) => {
  let v = isValueObject(value) ? value.transform ? await resolveTransform(value, inp, opt) : _dotProp.default.get(inp, value.field) : value;
  if (v == null && typeof value.defaultValue !== 'undefined') v = await resolveFrom(value.defaultValue, inp, opt);
  if (opt.strict && typeof v === 'undefined') v = null;
  return v;
};

const transform = async (stack, inp, {
  strict,
  transforms = transformDefs,
  types = typeDefs
} = {}) => {
  if (typeof stack !== 'object') throw new Error('Missing stack argument!');
  if (inp == null || typeof inp !== 'object') return {}; // short out on invalid input

  const out = {};
  await Promise.all(Object.entries(stack).map(async ([to, from]) => {
    _dotProp.default.set(out, to, await resolveFrom(from, inp, {
      strict,
      transforms,
      types
    }));
  }));
  return out;
};

exports.transform = transform;