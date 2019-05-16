import dot from 'dot-prop'
import isObject from 'is-plain-object'
import getTypes from './getTypes'
import * as typeDefs from './presets/types'
import * as transformDefs from './presets/transforms'

const isValueObject = (v) =>
  isObject(v) && (v.field || v.transform)

const validateArgumentTypes = (transform, sig, arg, types) => {
  if (sig.types === 'any') return true // allows anything
  const argTypes = getTypes(arg, types)
  const typesValid = argTypes.some((t) => sig.types.includes(t))
  if (!typesValid) throw new Error(`Argument "${sig.name}" for "${transform.name}" must be of type: ${sig.types.join(', ')}, instead got ${argTypes.join(', ')}`)
  return true
}

const resolveTransform = async (value, inp, opt) => {
  const transform = opt.transforms[value.transform]
  if (!transform || typeof transform.execute !== 'function') {
    throw new Error(`Invalid transform: ${value.transform}`)
  }
  const resolvedArgs = value.arguments
    ? await Promise.all(value.arguments.map(async (a) =>
      isValueObject(a)
        ? resolveFrom(a, inp, opt)
        : a
    ))
    : []

  let skip = false
  if (transform.signature) {
    transform.signature.forEach((sig, idx) => {
      const arg = resolvedArgs[idx]
      // if any required arg is missing, transform returns undefined
      if (sig.required && arg == null) {
        skip = true
        return
      }
      validateArgumentTypes(transform, sig, arg, opt.types)
    })
  }
  if (transform.splat) {
    const existingArgs = resolvedArgs.filter((v) => v != null)
    // if number of required args not present, transform returns undefined
    if (transform.splat.required > existingArgs.length) {
      skip = true
    }
    value.arguments.forEach((arg) => {
      validateArgumentTypes(transform, transform.splat, arg, opt.types)
    })
  }
  return skip ? undefined : transform.execute(...resolvedArgs)
}

const resolveFrom = async (value, inp, opt) => {
  let v = isValueObject(value)
    ? value.transform
      ? await resolveTransform(value, inp, opt)
      : dot.get(inp, value.field)
    : value

  if (v == null && typeof value.defaultValue !== 'undefined') v = value.defaultValue
  if (opt.strict && typeof v === 'undefined') v = null
  return v
}

export const transform = async (stack, inp, { strict, transforms=transformDefs, types=typeDefs }={}) => {
  if (!Array.isArray(stack)) throw new Error('Missing stack argument!')
  if (inp == null || typeof inp !== 'object') return {} // short out on invalid input
  const out = {}
  await Promise.all(stack.map(async (op) => {
    dot.set(out, op.to, await resolveFrom(op.from, inp, { strict, transforms, types }))
  }))
  return out
}
