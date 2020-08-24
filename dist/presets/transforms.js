"use strict";

exports.__esModule = true;
exports.createLineString = exports.createPoint = exports.createArray = exports.createDate = exports.createNumber = exports.createString = exports.creatBoolean = exports.ensureMulti = exports.centroid = exports.simplifyGeometry = exports.join = exports.concatenate = exports.flatten = exports.compact = exports.subtract = exports.add = exports.convert = exports.split = exports.slug = exports.guid = exports.capitalizeWords = exports.capitalize = exports.phone = exports.normalize = void 0;

var _phone = _interopRequireDefault(require("phone"));

var _aguid = _interopRequireDefault(require("aguid"));

var _slugify = _interopRequireDefault(require("@sindresorhus/slugify"));

var _capitalize = _interopRequireDefault(require("capitalize"));

var _convertUnits = _interopRequireDefault(require("convert-units"));

var _lodash = require("lodash");

var _turf = require("@turf/turf");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

// TODO:
// tz, geo.locate, geo.search, geo.intersection, geo.snap, geo.navigate, geo.snap, geo.tz
const convertPossibilities = (0, _convertUnits.default)().list().map(i => ({
  value: i.abbr,
  label: i.singular,
  group: [i.measure, i.system]
})); // Strings

const normalize = {
  name: 'Normalize',
  notes: 'Removes excess whitespace and lowercases text',
  signature: [{
    name: 'Text',
    types: ['string'],
    required: true
  }],
  returns: 'string',
  execute: v => {
    const o = String(v).trim();
    if (o.length === 0) return;
    return o.replace(/\s\s+/g, ' ').toLowerCase();
  }
};
exports.normalize = normalize;
const phone = {
  name: 'Phone Number',
  notes: 'Reformats as a standard international phone number',
  signature: [{
    name: 'Number',
    types: ['string', 'number'],
    required: true
  }, {
    name: 'Country Code',
    types: ['string']
  }],
  returns: 'string',
  execute: (v, country = 'USA') => {
    const res = (0, _phone.default)(String(v), country);
    if (!res || res.length === 0) return null;
    return res[0];
  }
};
exports.phone = phone;
const capitalize = {
  name: 'Capitalize',
  notes: 'Capitalizes the first word in every sentence',
  signature: [{
    name: 'Text',
    types: ['string'],
    required: true
  }],
  returns: 'string',
  execute: v => (0, _capitalize.default)(v)
};
exports.capitalize = capitalize;
const capitalizeWords = {
  name: 'Capitalize Words',
  notes: 'Capitalizes the first letter of every word',
  signature: [{
    name: 'Text',
    types: ['string'],
    required: true
  }],
  returns: 'string',
  execute: v => _capitalize.default.words(v)
};
exports.capitalizeWords = capitalizeWords;
const guid = {
  name: 'Unique ID',
  notes: 'Combines multiple semi-unique values into a Globally Unique ID (GUID)',
  splat: {
    name: 'Values',
    types: ['string', 'number', 'date', 'boolean'],
    required: 1
  },
  returns: 'string',
  execute: (...v) => {
    const args = v.filter(i => i != null);
    if (args.length === 0) return;
    return (0, _aguid.default)(args.join('-'));
  }
};
exports.guid = guid;
const slug = {
  name: 'Slug',
  notes: 'Combines multiple semi-unique values into a human readable ID',
  splat: {
    name: 'Values',
    types: ['string', 'number', 'date', 'boolean'],
    required: 1
  },
  returns: 'string',
  execute: (...v) => {
    const args = v.filter(i => i != null).map(v => v instanceof Date ? v.toLocaleDateString() : v);
    if (args.length === 0) return;
    return (0, _slugify.default)(args.join(' ')).toLowerCase();
  }
};
exports.slug = slug;
const split = {
  name: 'Split',
  notes: 'Splits a string by a separator into a list',
  signature: [{
    name: 'Value',
    types: ['string'],
    required: true
  }, {
    name: 'Separator',
    types: ['string']
  }],
  returns: 'array',
  execute: (v, sep = ', ') => v.split(sep)
}; // Numbers

exports.split = split;
const convert = {
  name: 'Convert',
  notes: 'Converts one unit to another',
  signature: [{
    name: 'Value',
    types: ['number'],
    required: true
  }, {
    name: 'From Unit',
    types: ['string'],
    required: true,
    options: convertPossibilities
  }, {
    name: 'To Unit',
    types: ['string'],
    required: true,
    options: convertPossibilities
  }],
  returns: 'number',
  execute: (v, from, to) => {
    if (typeof v === 'string') v = parseFloat(v);
    if (isNaN(v)) return;
    if (typeof v !== 'number') return;
    return (0, _convertUnits.default)(v).from(from).to(to);
  }
};
exports.convert = convert;
const add = {
  name: 'Add',
  notes: 'Applies addition to multiple numbers',
  splat: {
    name: 'Values',
    types: ['number'],
    required: 2
  },
  returns: 'number',
  execute: (...a) => a.reduce((p, i) => p + i, 0)
};
exports.add = add;
const subtract = {
  name: 'Subtract',
  notes: 'Applies subtraction to multiple numbers',
  splat: {
    name: 'Values',
    types: ['number'],
    required: 2
  },
  returns: 'number',
  execute: (...a) => a.reduce((p, i) => p - i, 0)
}; // Arrays

exports.subtract = subtract;
const compact = {
  name: 'Compact',
  notes: 'Removes all empty or false values from a list',
  signature: [{
    name: 'Value',
    types: ['array'],
    required: true
  }],
  returns: 'array',
  execute: v => (0, _lodash.compact)(v)
};
exports.compact = compact;
const flatten = {
  name: 'Flatten',
  notes: 'Removes a level of createLineString from a list',
  signature: [{
    name: 'Value',
    types: ['array'],
    required: true
  }],
  returns: 'array',
  execute: v => (0, _lodash.flatten)(v)
};
exports.flatten = flatten;
const concatenate = {
  name: 'Concatenate',
  notes: 'Merges multiple lists together',
  splat: {
    name: 'Values',
    types: ['array'],
    required: 2
  },
  returns: 'array',
  execute: (...v) => (0, _lodash.concat)(...v)
};
exports.concatenate = concatenate;
const join = {
  name: 'Join',
  notes: 'Converts all elements in a list to a string joined by a separator',
  signature: [{
    name: 'Value',
    types: ['array'],
    required: true
  }, {
    name: 'Separator',
    types: ['string']
  }],
  returns: 'string',
  execute: (v, sep = ', ') => v.join(sep)
}; // Geometries

exports.join = join;
const simplifyGeometry = {
  name: 'Simplify',
  notes: 'Removes excess precision and simplifies the shape of any geometry',
  signature: [{
    name: 'Geometry',
    types: ['point', 'line', 'polygon', 'multiline', 'multipolygon'],
    required: true
  }, {
    name: 'Tolerance',
    types: ['number']
  }],
  returns: ['point', 'line', 'polygon', 'multiline', 'multipolygon'],
  execute: (geometry, tolerance = 1) => {
    const actualTolerance = tolerance * 0.00001; // tolerance arg is in meters

    geometry = geometry.geometry || geometry;
    if (geometry == null) return;

    const {
      type,
      coordinates
    } = geometry,
          rest = _objectWithoutProperties(geometry, ["type", "coordinates"]);

    if (!type) throw new Error('type is required');
    if (!coordinates) throw new Error('coordinates is required');

    if (type === 'LineString' && coordinates.length === 2 && (0, _lodash.isEqual)(coordinates[0], coordinates[1])) {
      throw new Error('Invalid LineString! Only two coordinates that are identical.');
    }

    const res = (0, _turf.simplify)((0, _turf.cleanCoords)((0, _turf.truncate)(geometry, {
      precision: 6,
      coordinates: 3
    })), {
      tolerance: actualTolerance
    });
    return _objectSpread(_objectSpread({
      type
    }, rest), {}, {
      coordinates: res.coordinates
    });
  }
};
exports.simplifyGeometry = simplifyGeometry;
const centroid = {
  name: 'Centroid',
  notes: 'Returns the centroid point of a geometry.',
  signature: [{
    name: 'Geometry',
    types: ['line', 'polygon', 'multiline', 'multipolygon'],
    required: true
  }],
  returns: ['point'],
  execute: geometry => {
    geometry = geometry.geometry || geometry;
    if (geometry == null) return;

    const {
      type,
      coordinates
    } = geometry,
          rest = _objectWithoutProperties(geometry, ["type", "coordinates"]);

    if (!type) throw new Error('type is required');
    if (!coordinates) throw new Error('coordinates is required');
    const res = (0, _turf.centroid)(geometry).geometry;
    return _objectSpread(_objectSpread({}, res), rest);
  }
};
exports.centroid = centroid;
const ensureMulti = {
  name: 'Ensure Multi',
  notes: 'Converts any geometry to it\'s corresponding Multi type if needed',
  signature: [{
    name: 'Geometry',
    types: ['line', 'polygon', 'multiline', 'multipolygon'],
    required: true
  }],
  returns: ['multiline', 'multipolygon'],
  execute: geometry => {
    geometry = geometry.geometry || geometry;
    if (!geometry.type) throw new Error('type is required');
    if (!geometry.coordinates) throw new Error('coordinates is required');
    const isSingle = geometry.type.indexOf('Multi') !== 0;
    if (!isSingle) return geometry; // is a multi, return early

    const {
      type,
      coordinates
    } = geometry,
          rest = _objectWithoutProperties(geometry, ["type", "coordinates"]);

    return _objectSpread(_objectSpread({
      type: `Multi${type}`
    }, rest), {}, {
      coordinates: [coordinates]
    });
  }
}; // Type casting/creation

exports.ensureMulti = ensureMulti;
const creatBoolean = {
  name: 'Create Boolean (True/False)',
  notes: 'Converts any value to a boolean',
  signature: [{
    name: 'Value',
    types: 'any',
    required: true
  }],
  returns: 'boolean',
  execute: v => Boolean(v)
};
exports.creatBoolean = creatBoolean;
const createString = {
  name: 'Create Text',
  notes: 'Converts any value to text',
  signature: [{
    name: 'Value',
    types: 'any',
    required: true
  }],
  returns: 'string',
  execute: v => {
    if (typeof v === 'string') return v; // already text

    if (Array.isArray(v)) return v.join(', ');
    if (v instanceof Date) return v.toISOString();
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }
};
exports.createString = createString;
const createNumber = {
  name: 'Create Number',
  notes: 'Converts text to a number',
  signature: [{
    name: 'Value',
    types: ['string'],
    required: true
  }],
  returns: 'number',
  execute: v => parseFloat(v.replace(/[^\d.-]/g, ''))
};
exports.createNumber = createNumber;
const createDate = {
  name: 'Create Date',
  notes: 'Converts text or a number to a date',
  signature: [{
    name: 'Value',
    types: ['string', 'number'],
    required: true
  }],
  returns: 'date',
  execute: v => new Date(v)
};
exports.createDate = createDate;
const createArray = {
  name: 'Create List',
  notes: 'Constructs a list from a number of items',
  splat: {
    name: 'Values',
    types: 'any',
    required: 1
  },
  returns: 'array',
  execute: (...a) => a
};
exports.createArray = createArray;
const createPoint = {
  name: 'Create Point',
  notes: 'Constructs a GeoJSON Point from a coordinate',
  signature: [{
    name: 'Longitude',
    types: ['number'],
    required: true
  }, {
    name: 'Latitude',
    types: ['number'],
    required: true
  }],
  returns: 'point',
  execute: (lon, lat) => ({
    type: 'Point',
    coordinates: [lon, lat]
  })
};
exports.createPoint = createPoint;
const createLineString = {
  name: 'Create LineString',
  notes: 'Constructs a GeoJSON LineString from start and end coordinates',
  signature: [{
    name: 'Start Longitude',
    types: ['number'],
    required: true
  }, {
    name: 'Start Latitude',
    types: ['number'],
    required: true
  }, {
    name: 'End Longitude',
    types: ['number'],
    required: true
  }, {
    name: 'End Latitude',
    types: ['number'],
    required: true
  }],
  returns: 'line',
  execute: (startLon, startLat, endLon, endLat) => ({
    type: 'LineString',
    coordinates: [[startLon, startLat], [endLon, endLat]]
  })
};
exports.createLineString = createLineString;