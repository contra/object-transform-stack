import dot from 'dot-prop'
import isObject from 'is-plain-object'
import getTypes from './getTypes'
import * as typeDefs from './presets/types'
import * as transformDefs from './presets/transforms'

const isValueObject = (v) =>
  isObject(v) && (v.field || v.transform)

const validateArgumentTypes = (transform, sig, arg, types) => {
  const argTypes = getTypes(arg, types)
  const typesValid = argTypes.some((t) => sig.types.includes(t))
  if (!typesValid) throw new Error(`Argument "${sig.name}" for "${transform.name}" must be of type: ${sig.types.join(', ')}, instead got ${argTypes.join(', ')}`)
  return true
}

const resolveTransform = (value, inp, opt) => {
  const transform = opt.transforms[value.transform]
  if (!transform || typeof transform.execute !== 'function') {
    throw new Error(`Invalid transform: ${value.transform}`)
  }
  const resolvedArgs = value.arguments
    ? value.arguments.map((a) =>
      isValueObject(a)
        ? resolveFrom(a, inp, opt)
        : a
    )
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
  return skip ? undefined : transform.execute(...resolvedArgs)
}

const resolveFrom = (value, inp, opt) => {
  let v = isValueObject(value)
    ? value.transform
      ? resolveTransform(value, inp, opt)
      : dot.get(inp, value.field)
    : value

  if (v == null && typeof value.defaultValue !== 'undefined') v = value.defaultValue
  if (opt.strict && typeof v === 'undefined') v = null
  return v
}

export const transform = (stack, inp, { strict, transforms=transformDefs, types=typeDefs }={}) => {
  if (!Array.isArray(stack)) throw new Error('Missing stack argument!')
  if (inp == null || typeof inp !== 'object') return {} // short out on invalid input
  return stack.reduce((prev, op) => {
    dot.set(prev, op.to, resolveFrom(op.from, inp, { strict, transforms, types }))
    return prev
  }, {})
}
