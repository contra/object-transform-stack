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
    const v = dot.get(inp, op.from)
    // if strict, use null
    // otherwise use undefined
    const actual = typeof v === 'undefined'
      ? strict ? null : v
      : applyTransforms(op, v, transforms)
    dot.set(prev, op.to, actual)
    return prev
  }, {})
}
