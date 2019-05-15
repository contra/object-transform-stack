'use strict';

exports.__esModule = true;
exports.multilinestring = exports.linestring = exports.multipolygon = exports.polygon = exports.point = exports.date = exports.object = exports.array = exports.boolean = exports.string = exports.number = undefined;

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _isNumber = require('is-number');

var _isNumber2 = _interopRequireDefault(_isNumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const number = exports.number = {
  check: v => (0, _isNumber2.default)(v),
  ensure: v => parseFloat(v)
};
const string = exports.string = {
  check: v => typeof v === 'string'
};
const boolean = exports.boolean = {
  check: v => typeof v === 'boolean'
};
const array = exports.array = {
  check: v => Array.isArray(v)
};
const object = exports.object = {
  check: v => (0, _isPlainObject2.default)(v)
};
const date = exports.date = {
  check: v => v instanceof Date && !isNaN(v) || !isNaN(Date.parse(v)),
  ensure: v => v instanceof Date ? v : new Date(Date.parse(v))
};
const point = exports.point = {
  check: v => object.check(v) && v.type === 'Point'
};
const polygon = exports.polygon = {
  check: v => object.check(v) && v.type === 'Polygon'
};
const multipolygon = exports.multipolygon = {
  check: v => object.check(v) && v.type === 'MultiPolygon'
};
const linestring = exports.linestring = {
  check: v => object.check(v) && v.type === 'LineString'
};
const multilinestring = exports.multilinestring = {
  check: v => object.check(v) && v.type === 'MultiLineString'
};