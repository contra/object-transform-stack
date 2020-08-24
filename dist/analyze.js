"use strict";

exports.__esModule = true;
exports.analyze = exports.paths = void 0;

var _lodash = _interopRequireDefault(require("lodash.foreach"));

var _lodash2 = _interopRequireDefault(require("lodash.mergewith"));

var _lodash3 = _interopRequireDefault(require("lodash.union"));

var _lodash4 = _interopRequireDefault(require("lodash.sortby"));

var _isPlainObj = _interopRequireDefault(require("is-plain-obj"));

var _getTypes = _interopRequireDefault(require("./getTypes"));

var typeDefs = _interopRequireWildcard(require("./presets/types"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getPaths = (o, {
  depthLimit,
  arrayLimit
} = {}) => {
  const out = {};

  const visit = (obj, keys = []) => {
    const isArray = Array.isArray(obj);
    (0, _lodash.default)(obj, (v, key) => {
      if (isArray && key > arrayLimit) return; // hit our limit

      if (depthLimit && keys.length >= depthLimit) return;
      keys.push(String(key).replace(/\./g, '\\.'));
      out[keys.join('.')] = v;
      if (Array.isArray(v) || (0, _isPlainObj.default)(v)) visit(v, keys);
      keys.pop();
    });
  };

  visit(o);
  return out;
};

const paths = (inp, {
  types = typeDefs,
  depthLimit,
  arrayLimit
} = {}) => {
  const paths = getPaths(inp, {
    depthLimit,
    arrayLimit
  });
  return Object.entries(paths).reduce((prev, [path, v]) => {
    prev.push({
      path,
      types: (0, _getTypes.default)(v, types)
    });
    return prev;
  }, []);
};

exports.paths = paths;

const analyze = (inp, {
  types = typeDefs,
  depthLimit,
  arrayLimit
} = {}) => {
  const getPathsAndTypes = i => {
    const paths = getPaths(i, {
      types,
      depthLimit,
      arrayLimit
    });
    return Object.entries(paths).reduce((prev, [path, v]) => {
      prev[path] = (0, _getTypes.default)(v, types);
      return prev;
    }, {});
  };

  const merger = (prev, src) => (0, _lodash3.default)(prev, src);

  const all = (0, _lodash2.default)(...inp.map(getPathsAndTypes), merger);
  return Object.entries(all).map(([path, types]) => ({
    path,
    types: (0, _lodash4.default)(types)
  }));
};

exports.analyze = analyze;