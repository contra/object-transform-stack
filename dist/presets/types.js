"use strict";

exports.__esModule = true;
exports.multiline = exports.line = exports.multipolygon = exports.polygon = exports.point = exports.date = exports.object = exports.array = exports.boolean = exports.string = exports.number = void 0;

var _isPlainObj = _interopRequireDefault(require("is-plain-obj"));

var _isNumber = _interopRequireDefault(require("is-number"));

var _isDateLike = _interopRequireDefault(require("is-date-like"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const number = {
  name: 'Number',
  check: v => (0, _isNumber.default)(v)
};
exports.number = number;
const string = {
  name: 'Text',
  check: v => typeof v === 'string'
};
exports.string = string;
const boolean = {
  name: 'True/False',
  check: v => typeof v === 'boolean'
};
exports.boolean = boolean;
const array = {
  name: 'List',
  check: v => Array.isArray(v)
};
exports.array = array;
const object = {
  name: 'Map',
  check: v => (0, _isPlainObj.default)(v)
};
exports.object = object;
const date = {
  name: 'Date/Time',
  check: v => (0, _isDateLike.default)(v)
};
exports.date = date;
const point = {
  name: 'GeoJSON Point',
  check: v => object.check(v) && (v.type === 'Point' || v.type === 'Feature ' && v.geometry && v.geometry.type === 'Point')
};
exports.point = point;
const polygon = {
  name: 'GeoJSON Polygon',
  check: v => object.check(v) && (v.type === 'Polygon' || v.type === 'Feature ' && v.geometry && v.geometry.type === 'Polygon')
};
exports.polygon = polygon;
const multipolygon = {
  name: 'GeoJSON MultiPolygon',
  check: v => object.check(v) && (v.type === 'MultiPolygon' || v.type === 'Feature ' && v.geometry && v.geometry.type === 'MultiPolygon')
};
exports.multipolygon = multipolygon;
const line = {
  name: 'GeoJSON LineString',
  check: v => object.check(v) && (v.type === 'LineString' || v.type === 'Feature ' && v.geometry && v.geometry.type === 'LineString')
};
exports.line = line;
const multiline = {
  name: 'GeoJSON MultiLineString',
  check: v => object.check(v) && (v.type === 'MultiLineString' || v.type === 'Feature ' && v.geometry && v.geometry.type === 'MultiLineString')
};
exports.multiline = multiline;