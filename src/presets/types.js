import isObject from 'is-plain-object'
import isNumber from 'is-number'

export const number = {
  name: 'Number',
  check: (v) => isNumber(v)
}
export const string = {
  name: 'Text',
  check: (v) => typeof v === 'string'
}
export const boolean = {
  name: 'True/False',
  check: (v) => typeof v === 'boolean'
}
export const array = {
  name: 'List',
  check: (v) => Array.isArray(v)
}
export const object = {
  name: 'Map',
  check: (v) => isObject(v)
}
export const date = {
  name: 'Date/Time',
  check: (v) => v instanceof Date && !isNaN(v) || !isNaN(Date.parse(v))
}
export const point = {
  name: 'GeoJSON Point',
  check: (v) =>
    object.check(v) && v.type === 'Point'
      || v.type === 'Feature ' && v.geometry && v.geometry.type === 'Point'
}
export const polygon = {
  name: 'GeoJSON Polygon',
  check: (v) =>
    object.check(v) && v.type === 'Polygon'
      || v.type === 'Feature ' && v.geometry && v.geometry.type === 'Polygon'
}
export const multipolygon = {
  name: 'GeoJSON MultiPolygon',
  check: (v) =>
    object.check(v) && v.type === 'MultiPolygon'
      || v.type === 'Feature ' && v.geometry && v.geometry.type === 'MultiPolygon'
}
export const linestring = {
  name: 'GeoJSON LineString',
  check: (v) =>
    object.check(v) && v.type === 'LineString'
      || v.type === 'Feature ' && v.geometry && v.geometry.type === 'LineString'
}
export const multilinestring = {
  name: 'GeoJSON MultiLineString',
  check: (v) =>
    object.check(v) && v.type === 'MultiLineString'
      || v.type === 'Feature ' && v.geometry && v.geometry.type === 'MultiLineString'
}
