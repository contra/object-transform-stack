'use strict';

exports.__esModule = true;
exports.multilinestring = exports.linestring = exports.multipolygon = exports.polygon = exports.point = exports.date = exports.object = exports.array = exports.boolean = exports.string = exports.number = undefined;

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _isNumber = require('is-number');

var _isNumber2 = _interopRequireDefault(_isNumber);

var _isDateLike = require('is-date-like');

var _isDateLike2 = _interopRequireDefault(_isDateLike);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const number = exports.number = {
  name: 'Number',
  check: v => (0, _isNumber2.default)(v)
};
const string = exports.string = {
  name: 'Text',
  check: v => typeof v === 'string'
};
const boolean = exports.boolean = {
  name: 'True/False',
  check: v => typeof v === 'boolean'
};
const array = exports.array = {
  name: 'List',
  check: v => Array.isArray(v)
};
const object = exports.object = {
  name: 'Map',
  check: v => (0, _isPlainObject2.default)(v)
};
const date = exports.date = {
  name: 'Date/Time',
  check: v => (0, _isDateLike2.default)(v)
};
const point = exports.point = {
  name: 'GeoJSON Point',
  check: v => object.check(v) && v.type === 'Point' || v.type === 'Feature ' && v.geometry && v.geometry.type === 'Point'
};
const polygon = exports.polygon = {
  name: 'GeoJSON Polygon',
  check: v => object.check(v) && v.type === 'Polygon' || v.type === 'Feature ' && v.geometry && v.geometry.type === 'Polygon'
};
const multipolygon = exports.multipolygon = {
  name: 'GeoJSON MultiPolygon',
  check: v => object.check(v) && v.type === 'MultiPolygon' || v.type === 'Feature ' && v.geometry && v.geometry.type === 'MultiPolygon'
};
const linestring = exports.linestring = {
  name: 'GeoJSON LineString',
  check: v => object.check(v) && v.type === 'LineString' || v.type === 'Feature ' && v.geometry && v.geometry.type === 'LineString'
};
const multilinestring = exports.multilinestring = {
  name: 'GeoJSON MultiLineString',
  check: v => object.check(v) && v.type === 'MultiLineString' || v.type === 'Feature ' && v.geometry && v.geometry.type === 'MultiLineString'
};