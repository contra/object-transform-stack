// TODO:
// normalize, phone, guid, slug, camelize, capitalize, convert,
// geo.locate, geo.search, geo.intersection, geo.snap
// geo.simplify, geo.navigate, geo.multi, geo.snap

// string transforms
export const normalize = {
  // TODO
}

// geo transforms
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
