import isObject from 'is-plain-object'
import isNumber from 'is-number'

export const number = {
  check: (v) => isNumber(v),
  ensure: (v) => parseFloat(v)
}
export const string = {
  check: (v) => typeof v === 'string'
}
export const boolean = {
  check: (v) => typeof v === 'boolean'
}
export const array = {
  check: (v) => Array.isArray(v)
}
export const object = {
  check: (v) => isObject(v)
}
export const date = {
  check: (v) =>
    v instanceof Date && !isNaN(v) || !isNaN(Date.parse(v)),
  ensure: (v) => v instanceof Date ? v : new Date(Date.parse(v))
}
export const point = {
  check: (v) => object.check(v) && v.type === 'Point'
}
export const polygon = {
  check: (v) => object.check(v) && v.type === 'Polygon'
}
export const multipolygon = {
  check: (v) => object.check(v) && v.type === 'MultiPolygon'
}
export const linestring = {
  check: (v) => object.check(v) && v.type === 'LineString'
}
export const multilinestring = {
  check: (v) => object.check(v) && v.type === 'MultiLineString'
}
