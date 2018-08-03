import isObject from 'is-plain-object'
import isNumber from 'is-number'

export const number = (v) => isNumber(v)
export const string = (v) => typeof v === 'string'
export const boolean = (v) => typeof v === 'boolean'
export const array = (v) => Array.isArray(v)
export const object = (v) => isObject(v)
export const date = (v) => !isNaN(Date.parse(v))
export const point = (v) => object(v) && v.type === 'Point'
export const polygon = (v) => object(v) && v.type === 'Polygon'
export const multipolygon = (v) => object(v) && v.type === 'MultiPolygon'
export const linestring = (v) => object(v) && v.type === 'LineString'
export const multilinestring = (v) => object(v) && v.type === 'MultiLineString'
