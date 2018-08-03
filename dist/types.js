'use strict';

exports.__esModule = true;
exports.multilinestring = exports.linestring = exports.multipolygon = exports.polygon = exports.point = exports.date = exports.object = exports.array = exports.boolean = exports.string = exports.number = undefined;

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _isNumber = require('is-number');

var _isNumber2 = _interopRequireDefault(_isNumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const number = exports.number = v => (0, _isNumber2.default)(v);
const string = exports.string = v => typeof v === 'string';
const boolean = exports.boolean = v => typeof v === 'boolean';
const array = exports.array = v => Array.isArray(v);
const object = exports.object = v => (0, _isPlainObject2.default)(v);
const date = exports.date = v => !isNaN(Date.parse(v));
const point = exports.point = v => object(v) && v.type === 'Point';
const polygon = exports.polygon = v => object(v) && v.type === 'Polygon';
const multipolygon = exports.multipolygon = v => object(v) && v.type === 'MultiPolygon';
const linestring = exports.linestring = v => object(v) && v.type === 'LineString';
const multilinestring = exports.multilinestring = v => object(v) && v.type === 'MultiLineString';