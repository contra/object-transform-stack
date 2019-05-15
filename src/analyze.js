import forEach from 'lodash.foreach'
import mergeWith from 'lodash.mergewith'
import union from 'lodash.union'
import isObject from 'is-plain-object'
import getTypes from './getTypes'
import * as typeDefs from './presets/types'

const getPaths = (o) => {
  const out = {}
  const visit = (obj, keys=[]) => {
    forEach(obj, (v, key) => {
      keys.push(String(key).replace(/\./g, '\\.'))
      out[keys.join('.')] = v
      if (Array.isArray(v) || isObject(v)) visit(v, keys)
      keys.pop()
    })
  }
  visit(o)
  return out
}

export const paths = (inp, { types=typeDefs }={}) => {
  const paths = getPaths(inp)
  return Object.entries(paths).reduce((prev, [ path, v ]) => {
    prev.push({
      path,
      types: getTypes(v, types)
    })
    return prev
  }, [])
}

export const analyze = (inp, { types=typeDefs }={}) => {
  const getPathsAndTypes = (i) => {
    const paths = getPaths(i)
    return Object.entries(paths).reduce((prev, [ path, v ]) => {
      prev[path] = getTypes(v, types)
      return prev
    }, {})
  }
  const merger = (prev, src) => union(prev, src)
  const all = mergeWith(...inp.map(getPathsAndTypes), merger)
  return Object.entries(all).map(([ path, types ]) => ({
    path,
    types
  }))
}
