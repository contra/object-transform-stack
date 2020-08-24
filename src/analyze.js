import { forEach, mergeWith, union, sortBy } from 'lodash'
import isObject from 'is-plain-obj'
import getTypes from './getTypes'
import * as typeDefs from './presets/types'

const getPaths = (o, { depthLimit, arrayLimit }={}) => {
  const out = {}
  const visit = (obj, keys=[]) => {
    const isArray = Array.isArray(obj)
    forEach(obj, (v, key) => {
      if (isArray && key > arrayLimit) return // hit our limit
      if (depthLimit && keys.length >= depthLimit) return
      keys.push(String(key).replace(/\./g, '\\.'))
      out[keys.join('.')] = v
      if (Array.isArray(v) || isObject(v)) visit(v, keys)
      keys.pop()
    })
  }
  visit(o)
  return out
}

export const paths = (inp, { types=typeDefs, depthLimit, arrayLimit }={}) => {
  const paths = getPaths(inp, { depthLimit, arrayLimit })
  return Object.entries(paths).reduce((prev, [ path, v ]) => {
    prev.push({
      path,
      types: getTypes(v, types)
    })
    return prev
  }, [])
}

export const analyze = (inp, { types=typeDefs, depthLimit, arrayLimit }={}) => {
  const getPathsAndTypes = (i) => {
    const paths = getPaths(i, { types, depthLimit, arrayLimit })
    return Object.entries(paths).reduce((prev, [ path, v ]) => {
      prev[path] = getTypes(v, types)
      return prev
    }, {})
  }
  const merger = (prev, src) => union(prev, src)
  const all = mergeWith(...inp.map(getPathsAndTypes), merger)
  return Object.entries(all).map(([ path, types ]) => ({
    path,
    types: sortBy(types)
  }))
}
