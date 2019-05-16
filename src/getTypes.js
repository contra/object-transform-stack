import sort from 'lodash.sortby'

export default (v, types) =>
  sort(Object.entries(types).reduce((prev, [ type, fn ]) => {
    if (!fn || typeof fn.check !== 'function') return prev
    if (fn.check(v)) prev.push(type)
    return prev
  }, []))
