import phoneFormat from 'phone'
import aguid from 'aguid'
import slugify from '@sindresorhus/slugify'
import caps from 'capitalize'
import convertUnits from 'convert-units'
import isEqual from 'lodash.isequal'
import _flatten from 'lodash.flatten'
import _concat from 'lodash.concat'
import _compact from 'lodash.compact'
import { simplify, truncate, cleanCoords } from '@turf/turf'

// TODO:
// tz, geo.locate, geo.search, geo.intersection, geo.snap, geo.navigate, geo.snap, geo.tz

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
    name: 'Value',
    types: 'any',
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
    name: 'Value',
    types: 'any',
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
  notes: 'Splits a string by a seperator into a list',
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
      required: true
    },
    {
      name: 'To Unit',
      types: [ 'string' ],
      required: true
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
    name: 'Value',
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
    name: 'Value',
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
    name: 'Value',
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
  returns: 'array',
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
      types: [ 'point', 'linestring', 'polygon', 'multilinestring', 'multipolygon' ],
      required: true
    },
    {
      name: 'Tolerance',
      types: [ 'number' ]
    }
  ],
  returns: [ 'point', 'linestring', 'polygon', 'multilinestring', 'multipolygon' ],
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

export const ensureMulti = {
  name: 'Ensure Multi',
  notes: 'Converts any geometry to it\'s corresponding Multi type if needed',
  signature: [
    {
      name: 'Geometry',
      types: [ 'linestring', 'polygon', 'multilinestring', 'multipolygon' ],
      required: true
    }
  ],
  returns: [ 'multilinestring', 'multipolygon' ],
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

export const createArray = {
  name: 'Create List',
  notes: 'Constructs a list from a number of items',
  splat: {
    name: 'Value',
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
  returns: 'linestring',
  execute: (startLon, startLat, endLon, endLat) => ({
    type: 'LineString',
    coordinates: [
      [ startLon, startLat ],
      [ endLon, endLat ]
    ]
  })
}
