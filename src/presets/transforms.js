import phoneFormat from 'phone'
import aguid from 'aguid'
import slugify from '@sindresorhus/slugify'
import caps from 'capitalize'
import convertUnits from 'convert-units'
import { isEqual, flatten as _flatten, concat as _concat, compact as _compact } from 'lodash'
import { simplify, truncate, centroid as baseCentroid, cleanCoords } from '@turf/turf'

// TODO:
// tz, geo.locate, geo.search, geo.intersection, geo.snap, geo.navigate, geo.snap, geo.tz
const convertPossibilities = convertUnits().list().map((i) => ({
  value: i.abbr,
  label: i.singular,
  group: [ i.measure, i.system ]
}))

// Strings
export const normalize = {
  name: 'Normalize',
  notes: 'Removes excess whitespace and lowercases text',
  signature: [
    {
      name: 'Text',
      types: [ 'string' ],
      required: true
    }
  ],
  returns: 'string',
  execute: (v) => {
    const o = String(v).trim()
    if (o.length === 0) return
    return o.replace(/\s\s+/g, ' ').toLowerCase()
  }
}

export const phone = {
  name: 'Phone Number',
  notes: 'Reformats as a standard international phone number',
  signature: [
    {
      name: 'Number',
      types: [ 'string', 'number' ],
      required: true
    },
    {
      name: 'Country Code',
      types: [ 'string' ]
    }
  ],
  returns: 'string',
  execute: (v, country='USA') => {
    const res = phoneFormat(String(v), country)
    if (!res || res.length === 0) return null
    return res[0]
  }
}

export const capitalize = {
  name: 'Capitalize',
  notes: 'Capitalizes the first word in every sentence',
  signature: [
    {
      name: 'Text',
      types: [ 'string' ],
      required: true
    }
  ],
  returns: 'string',
  execute: (v) => caps(v)
}

export const capitalizeWords = {
  name: 'Capitalize Words',
  notes: 'Capitalizes the first letter of every word',
  signature: [
    {
      name: 'Text',
      types: [ 'string' ],
      required: true
    }
  ],
  returns: 'string',
  execute: (v) => caps.words(v)
}

export const guid = {
  name: 'Unique ID',
  notes: 'Combines multiple semi-unique values into a Globally Unique ID (GUID)',
  splat: {
    name: 'Values',
    types: [ 'string', 'number', 'date', 'boolean' ],
    required: 1
  },
  returns: 'string',
  execute: (...v) => {
    const args = v.filter((i) => i != null)
    if (args.length === 0) return
    return aguid(args.join('-'))
  }
}

export const slug = {
  name: 'Slug',
  notes: 'Combines multiple semi-unique values into a human readable ID',
  splat: {
    name: 'Values',
    types: [ 'string', 'number', 'date', 'boolean' ],
    required: 1
  },
  returns: 'string',
  execute: (...v) => {
    const args = v
      .filter((i) => i != null)
      .map((v) => v instanceof Date ? v.toLocaleDateString() : v)
    if (args.length === 0) return
    return slugify(args.join(' ')).toLowerCase()
  }
}
export const split = {
  name: 'Split',
  notes: 'Splits a string by a separator into a list',
  signature: [
    {
      name: 'Value',
      types: [ 'string' ],
      required: true
    },
    {
      name: 'Separator',
      types: [ 'string' ]
    }
  ],
  returns: 'array',
  execute: (v, sep=', ') =>
    v.split(sep)
}


// Numbers
export const convert = {
  name: 'Convert',
  notes: 'Converts one unit to another',
  signature: [
    {
      name: 'Value',
      types: [ 'number' ],
      required: true
    },
    {
      name: 'From Unit',
      types: [ 'string' ],
      required: true,
      options: convertPossibilities
    },
    {
      name: 'To Unit',
      types: [ 'string' ],
      required: true,
      options: convertPossibilities
    }
  ],
  returns: 'number',
  execute: (v, from, to) => {
    if (typeof v === 'string') v = parseFloat(v)
    if (isNaN(v)) return
    if (typeof v !== 'number') return
    return convertUnits(v).from(from).to(to)
  }
}
export const add = {
  name: 'Add',
  notes: 'Applies addition to multiple numbers',
  splat: {
    name: 'Values',
    types: [ 'number' ],
    required: 2
  },
  returns: 'number',
  execute: (...a) =>
    a.reduce((p, i) => p + i, 0)
}
export const subtract = {
  name: 'Subtract',
  notes: 'Applies subtraction to multiple numbers',
  splat: {
    name: 'Values',
    types: [ 'number' ],
    required: 2
  },
  returns: 'number',
  execute: (...a) =>
    a.reduce((p, i) => p - i, 0)
}

// Arrays
export const compact = {
  name: 'Compact',
  notes: 'Removes all empty or false values from a list',
  signature: [
    {
      name: 'Value',
      types: [ 'array' ],
      required: true
    }
  ],
  returns: 'array',
  execute: (v) => _compact(v)
}
export const flatten = {
  name: 'Flatten',
  notes: 'Removes a level of createLineString from a list',
  signature: [
    {
      name: 'Value',
      types: [ 'array' ],
      required: true
    }
  ],
  returns: 'array',
  execute: (v) => _flatten(v)
}
export const concatenate = {
  name: 'Concatenate',
  notes: 'Merges multiple lists together',
  splat: {
    name: 'Values',
    types: [ 'array' ],
    required: 2
  },
  returns: 'array',
  execute: (...v) => _concat(...v)
}
export const join = {
  name: 'Join',
  notes: 'Converts all elements in a list to a string joined by a separator',
  signature: [
    {
      name: 'Value',
      types: [ 'array' ],
      required: true
    },
    {
      name: 'Separator',
      types: [ 'string' ]
    }
  ],
  returns: 'string',
  execute: (v, sep=', ') =>
    v.join(sep)
}

// Geometries
export const simplifyGeometry = {
  name: 'Simplify',
  notes: 'Removes excess precision and simplifies the shape of any geometry',
  signature: [
    {
      name: 'Geometry',
      types: [ 'point', 'line', 'polygon', 'multiline', 'multipolygon' ],
      required: true
    },
    {
      name: 'Tolerance',
      types: [ 'number' ]
    }
  ],
  returns: [ 'point', 'line', 'polygon', 'multiline', 'multipolygon' ],
  execute: (geometry, tolerance=1) => {
    const actualTolerance = tolerance * 0.00001 // tolerance arg is in meters
    geometry = geometry.geometry || geometry
    if (geometry == null) return
    const { type, coordinates, ...rest } = geometry
    if (!type) throw new Error('type is required')
    if (!coordinates) throw new Error('coordinates is required')
    if (type === 'LineString' && coordinates.length === 2 && isEqual(coordinates[0], coordinates[1])) {
      throw new Error('Invalid LineString! Only two coordinates that are identical.')
    }
    const res = simplify(
      cleanCoords(truncate(geometry, { precision: 6, coordinates: 3 }))
      , { tolerance: actualTolerance })
    return {
      type,
      ...rest,
      coordinates: res.coordinates
    }
  }
}

export const centroid = {
  name: 'Centroid',
  notes: 'Returns the centroid point of a geometry.',
  signature: [
    {
      name: 'Geometry',
      types: [ 'line', 'polygon', 'multiline', 'multipolygon' ],
      required: true
    }
  ],
  returns: [ 'point' ],
  execute: (geometry) => {
    geometry = geometry.geometry || geometry
    if (geometry == null) return
    const { type, coordinates, ...rest } = geometry
    if (!type) throw new Error('type is required')
    if (!coordinates) throw new Error('coordinates is required')
    const res = baseCentroid(geometry).geometry
    return {
      ...res,
      ...rest
    }
  }
}

export const ensureMulti = {
  name: 'Ensure Multi',
  notes: 'Converts any geometry to it\'s corresponding Multi type if needed',
  signature: [
    {
      name: 'Geometry',
      types: [ 'line', 'polygon', 'multiline', 'multipolygon' ],
      required: true
    }
  ],
  returns: [ 'multiline', 'multipolygon' ],
  execute: (geometry) => {
    geometry = geometry.geometry || geometry
    if (!geometry.type) throw new Error('type is required')
    if (!geometry.coordinates) throw new Error('coordinates is required')
    const isSingle = geometry.type.indexOf('Multi') !== 0
    if (!isSingle) return geometry // is a multi, return early
    const { type, coordinates, ...rest } = geometry
    return {
      type: `Multi${type}`,
      ...rest,
      coordinates: [ coordinates ]
    }
  }
}

// Type casting/creation
export const creatBoolean = {
  name: 'Create Boolean (True/False)',
  notes: 'Converts any value to a boolean',
  signature: [
    {
      name: 'Value',
      types: 'any',
      required: true
    }
  ],
  returns: 'boolean',
  execute: (v) => Boolean(v)
}

export const createString = {
  name: 'Create Text',
  notes: 'Converts any value to text',
  signature: [
    {
      name: 'Value',
      types: 'any',
      required: true
    }
  ],
  returns: 'string',
  execute: (v) => {
    if (typeof v === 'string') return v // already text
    if (Array.isArray(v)) return v.join(', ')
    if (v instanceof Date) return v.toISOString()
    if (typeof v === 'object') return JSON.stringify(v)
    return String(v)
  }
}

export const createNumber = {
  name: 'Create Number',
  notes: 'Converts text to a number',
  signature: [
    {
      name: 'Value',
      types: [ 'string' ],
      required: true
    }
  ],
  returns: 'number',
  execute: (v) =>
    parseFloat(v.replace(/[^\d.-]/g, ''))
}

export const createDate = {
  name: 'Create Date',
  notes: 'Converts text or a number to a date',
  signature: [
    {
      name: 'Value',
      types: [ 'string', 'number' ],
      required: true
    }
  ],
  returns: 'date',
  execute: (v) =>
    new Date(v)
}


export const createArray = {
  name: 'Create List',
  notes: 'Constructs a list from a number of items',
  splat: {
    name: 'Values',
    types: 'any',
    required: 1
  },
  returns: 'array',
  execute: (...a) => a
}

export const createPoint = {
  name: 'Create Point',
  notes: 'Constructs a GeoJSON Point from a coordinate',
  signature: [
    {
      name: 'Longitude',
      types: [ 'number' ],
      required: true
    },
    {
      name: 'Latitude',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: 'point',
  execute: (lon, lat) => ({
    type: 'Point',
    coordinates: [ lon, lat ]
  })
}

export const createLineString = {
  name: 'Create LineString',
  notes: 'Constructs a GeoJSON LineString from start and end coordinates',
  signature: [
    {
      name: 'Start Longitude',
      types: [ 'number' ],
      required: true
    },
    {
      name: 'Start Latitude',
      types: [ 'number' ],
      required: true
    },
    {
      name: 'End Longitude',
      types: [ 'number' ],
      required: true
    },
    {
      name: 'End Latitude',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: 'line',
  execute: (startLon, startLat, endLon, endLat) => ({
    type: 'LineString',
    coordinates: [
      [ startLon, startLat ],
      [ endLon, endLat ]
    ]
  })
}
