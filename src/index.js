import dot from 'dot-prop'
import forEach from 'lodash.foreach'
import mergeWith from 'lodash.mergewith'
import union from 'lodash.union'
import isObject from 'is-plain-object'
import * as typeDefs from './types'

// transform stuff
const applyTransforms = (op, v, transforms={}) => {
  if (!Array.isArray(op.transforms)) return v
  return op.transforms.reduce((prev, k) => {
    const fn = transforms[k]
    if (typeof fn !== 'function') throw new Error(`Invalid transform: ${k}`)
    return fn(prev)
  }, v)
}

export const transform = (stack, inp, { strict, transforms }={}) => {
  if (!Array.isArray(stack)) throw new Error('Missing stack argument!')
  if (inp == null || typeof inp !== 'object') return {} // short out on invalid input

  return stack.reduce((prev, op) => {
    let v = dot.get(inp, op.from)
    if (typeof op.defaultValue !== 'undefined') v = op.defaultValue
    if (typeof v === 'undefined') {
      // if strict, use null
      // otherwise use undefined
      v = strict ? null : v
    } else {
      v = applyTransforms(op, v, transforms)
    }
    dot.set(prev, op.to, v)
    return prev
  }, {})
}

// path stuff
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
const getTypes = (v, types) =>
  Object.keys(types).reduce((prev, type) => {
    const fn = types[type]
    if (typeof fn !== 'function') return prev
    if (fn(v)) prev.push(type)
    return prev
  }, [])

export const paths = (inp, { types=typeDefs }={}) => {
  const paths = getPaths(inp)
  return Object.keys(paths).reduce((prev, path) => {
    const v = paths[path]
    prev.push({
      path,
      types: getTypes(v, types)
    })
    return prev
  }, [])
}

export const pathsAggregate = (inp, { types=typeDefs }={}) => {
  const getPathsAndTypes = (i) => {
    const paths = getPaths(i)
    return Object.keys(paths).reduce((prev, path) => {
      const v = paths[path]
      prev[path] = getTypes(v, types)
      return prev
    }, {})
  }
  const merger = (prev, src) => union(prev, src)
  const all = mergeWith(...inp.map(getPathsAndTypes), merger)
  return Object.keys(all).map((path) => ({
    path,
    types: all[path]
  }))
}
