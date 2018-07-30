import dot from 'dot-prop'

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
