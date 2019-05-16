'use strict';

exports.__esModule = true;
exports.createLineString = exports.createPoint = exports.ensureMulti = exports.simplifyGeometry = exports.slug = exports.guid = exports.convert = exports.capitalizeWords = exports.capitalize = exports.phone = exports.normalize = undefined;

var _phone = require('phone');

var _phone2 = _interopRequireDefault(_phone);

var _aguid = require('aguid');

var _aguid2 = _interopRequireDefault(_aguid);

var _slugify = require('@sindresorhus/slugify');

var _slugify2 = _interopRequireDefault(_slugify);

var _capitalize = require('capitalize');

var _capitalize2 = _interopRequireDefault(_capitalize);

var _convertUnits = require('convert-units');

var _convertUnits2 = _interopRequireDefault(_convertUnits);

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _turf = require('@turf/turf');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

// TODO:
// tz, geo.locate, geo.search, geo.intersection, geo.snap, geo.navigate, geo.snap, geo.tz

// string transforms
const normalize = exports.normalize = {
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

const phone = exports.phone = {
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
    const res = (0, _phone2.default)(String(v), country);
    if (!res || res.length === 0) return null;
    return res[0];
  }
};

const capitalize = exports.capitalize = {
  name: 'Capitalize',
  notes: 'Capitalizes the first word in every sentence',
  signature: [{
    name: 'Text',
    types: ['string'],
    required: true
  }],
  returns: 'string',
  execute: v => (0, _capitalize2.default)(v)
};

const capitalizeWords = exports.capitalizeWords = {
  name: 'Capitalize Words',
  notes: 'Capitalizes the first letter of every word',
  signature: [{
    name: 'Text',
    types: ['string'],
    required: true
  }],
  returns: 'string',
  execute: v => _capitalize2.default.words(v)
};

const convert = exports.convert = {
  name: 'Convert',
  notes: 'Converts one unit to another',
  signature: [{
    name: 'Value',
    types: ['number'],
    required: true
  }, {
    name: 'From Unit',
    types: ['string'],
    required: true
  }, {
    name: 'To Unit',
    types: ['string'],
    required: true
  }],
  returns: 'string',
  execute: (v, from, to) => {
    if (typeof v === 'string') v = parseFloat(v);
    if (isNaN(v)) return;
    if (typeof v !== 'number') return;
    return (0, _convertUnits2.default)(v).from(from).to(to);
  }
};

const guid = exports.guid = {
  name: 'Unique ID',
  notes: 'Combines multiple semi-unique values into a Globally Unique ID (GUID)',
  splat: {
    name: 'Value',
    types: 'any',
    required: 1
  },
  returns: 'string',
  execute: (...v) => {
    const args = v.filter(i => i != null);
    if (args.length === 0) return;
    return (0, _aguid2.default)(args.join('-'));
  }
};

const slug = exports.slug = {
  name: 'Slug',
  notes: 'Combines multiple semi-unique values into a human readable ID',
  splat: {
    name: 'Value',
    types: 'any',
    required: 1
  },
  returns: 'string',
  execute: (...v) => {
    const args = v.filter(i => i != null).map(v => v instanceof Date ? v.toLocaleDateString() : v);
    if (args.length === 0) return;
    return (0, _slugify2.default)(args.join(' ')).toLowerCase();
  }

  // geo transforms
};const simplifyGeometry = {
  name: 'Simplify',
  notes: 'Removes excess precision and simplifies the shape of any geometry',
  signature: [{
    name: 'Geometry',
    types: ['point', 'linestring', 'polygon', 'multilinestring', 'multipolygon'],
    required: true
  }, {
    name: 'Tolerance',
    types: ['number']
  }],
  returns: ['point', 'linestring', 'polygon', 'multilinestring', 'multipolygon'],
  execute: (geometry, tolerance = 1) => {
    const actualTolerance = tolerance * 0.00001; // tolerance arg is in meters
    geometry = geometry.geometry || geometry;
    if (geometry == null) return;
    const { type, coordinates } = geometry,
          rest = _objectWithoutProperties(geometry, ['type', 'coordinates']);
    if (!type) throw new Error('type is required');
    if (!coordinates) throw new Error('coordinates is required');
    if (type === 'LineString' && coordinates.length === 2 && (0, _lodash2.default)(coordinates[0], coordinates[1])) {
      throw new Error('Invalid LineString! Only two coordinates that are identical.');
    }
    const res = (0, _turf.simplify)((0, _turf.cleanCoords)((0, _turf.truncate)(geometry, { precision: 6, coordinates: 3 })), { tolerance: actualTolerance });
    return Object.assign({
      type
    }, rest, {
      coordinates: res.coordinates
    });
  }
};

exports.simplifyGeometry = simplifyGeometry;
const ensureMulti = {
  name: 'Ensure Multi',
  notes: 'Converts any geometry to it\'s corresponding Multi type if needed',
  signature: [{
    name: 'Geometry',
    types: ['linestring', 'polygon', 'multilinestring', 'multipolygon'],
    required: true
  }],
  returns: ['multilinestring', 'multipolygon'],
  execute: geometry => {
    geometry = geometry.geometry || geometry;
    if (!geometry.type) throw new Error('type is required');
    if (!geometry.coordinates) throw new Error('coordinates is required');
    const isSingle = geometry.type.indexOf('Multi') !== 0;
    if (!isSingle) return geometry; // is a multi, return early
    const { type, coordinates } = geometry,
          rest = _objectWithoutProperties(geometry, ['type', 'coordinates']);
    return Object.assign({
      type: `Multi${type}`
    }, rest, {
      coordinates: [coordinates]
    });
  }
};

exports.ensureMulti = ensureMulti;
const createPoint = exports.createPoint = {
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

const createLineString = exports.createLineString = {
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
  returns: 'linestring',
  execute: (startLon, startLat, endLon, endLat) => ({
    type: 'LineString',
    coordinates: [[startLon, startLat], [endLon, endLat]]
  })
};