/*eslint no-console: 0*/

import should from 'should'
import big from './big'
import uas from './uas'
import uasExpected from './uas-expected'
import featuresExpected from './uas-features-expected'
import { transform, paths, analyze } from '../src'

const basicTransforms = {
  uppercase: {
    name: 'Uppercase',
    signature: [
      {
        name: 'Text',
        types: [ 'string' ],
        required: true
      }
    ],
    returns: 'string',
    execute: (v) => v.toUpperCase()
  },
  lowercase: {
    name: 'Lowercase',
    signature: [
      {
        name: 'Text',
        types: [ 'string' ],
        required: true
      }
    ],
    returns: 'string',
    execute: (v) => v.toLowerCase()
  },
  trim: {
    name: 'Trim',
    signature: [
      {
        name: 'Text',
        types: [ 'string' ],
        required: true
      }
    ],
    returns: 'string',
    execute: (v) => v.trim()
  },
  add: {
    name: 'Add',
    signature: [
      {
        name: 'A',
        types: [ 'number' ],
        required: true
      },
      {
        name: 'B',
        types: [ 'number' ],
        required: true
      }
    ],
    returns: 'number',
    execute: (a, b) => a + b
  }
}

describe('transform', () => {
  it('should work on a basic object', () => {
    const stack = [
      { to: 'b', from: { field: 'a' } }
    ]
    const res = transform(stack, { a: 'b' })
    should(res).eql({ b: 'b' })
  })
  it('should work on a dot prop to', () => {
    const stack = [
      { to: 'a.data', from: { field: 'a' } }
    ]
    const res = transform(stack, { a: 'b' })
    should(res).eql({ a: { data: 'b' } })
  })
  it('should work on a dot prop from', () => {
    const stack = [
      { to: 'a.data', from: { field: 'a.result' } }
    ]
    const res = transform(stack, { a: { result: 'b' } })
    should(res).eql({ a: { data: 'b' } })
  })
  it('should work on a missing attribute', () => {
    const stack = [
      { to: 'a.data', from: { field: 'a.result' } },
      { to: 'a.data2', from: { field: 'a.missing' } }
    ]
    const res = transform(stack, { a: { result: 'b' } })
    should(res).eql({ a: { data: 'b', data2: undefined } })
  })
  it('should work on a missing attribute in strict mode', () => {
    const stack = [
      { to: 'a.data', from: { field: 'a.result' } },
      { to: 'a.data2', from: { field: 'a.missing' } }
    ]
    const res = transform(stack, { a: { result: 'b' } }, { strict: true })
    should(res).eql({ a: { data: 'b', data2: null } })
  })
  it('should work on a missing attribute with default', () => {
    const stack = [
      { to: 'a.data', from: { field: 'a.result' } },
      { to: 'a.data2', from: { field: 'a.missing', defaultValue: 'c' } }
    ]
    const res = transform(stack, { a: { result: 'b' } })
    should(res).eql({ a: { data: 'b', data2: 'c' } })
  })
  it('should work with multiple stack items that override eachother', () => {
    const stack = [
      { to: 'b', from: { field: 'a' } },
      { to: 'b', from: { field: 'c' } }
    ]
    const res = transform(stack, { a: 'b', c: 'c' })
    should(res).eql({ b: 'c' })
  })
  it('should work with a basic transform', () => {
    const stack = [
      {
        to: 'b',
        from: {
          transform: 'uppercase',
          arguments: [ { field: 'a' } ]
        }
      }
    ]
    const res = transform(stack, { a: 'abc' }, { transforms: basicTransforms })
    should(res).eql({ b: 'ABC' })
  })
  it('should work with a basic transform and defaultValue on field', () => {
    const stack = [
      {
        to: 'b',
        from: {
          transform: 'uppercase',
          arguments: [ { field: 'z', defaultValue: 'abc' } ]
        }
      }
    ]
    const res = transform(stack, { a: 'abc' }, { transforms: basicTransforms })
    should(res).eql({ b: 'ABC' })
  })
  it('should work with a basic transform and defaultValue on transform', () => {
    const stack = [
      {
        to: 'b',
        from: {
          transform: 'uppercase',
          defaultValue: 'XYZ',
          arguments: [ { field: 'z' } ]
        }
      }
    ]
    const res = transform(stack, { a: 'abc' }, { transforms: basicTransforms })
    should(res).eql({ b: 'XYZ' })
  })
  it('should work with nested transforms', () => {
    const stack = [
      {
        to: 'b',
        from: {
          transform: 'uppercase',
          arguments: [
            {
              transform: 'trim',
              arguments: [ { field: 'a' } ]
            }
          ]
        }
      }
    ]
    const res = transform(stack, { a: '   abc   ' }, { transforms: basicTransforms })
    should(res).eql({ b: 'ABC' })
  })
  it('should work with flat value transforms', () => {
    const stack = [
      {
        to: 'b',
        from: {
          transform: 'add',
          arguments: [
            { field: 'a' },
            123
          ]
        }
      }
    ]
    const res = transform(stack, { a: 1 }, { transforms: basicTransforms })
    should(res).eql({ b: 124 })
  })
  it('should error with invalid transform values', (done) => {
    const stack = [
      {
        to: 'b',
        from: {
          transform: 'uppercase',
          arguments: [
            {
              transform: 'trim',
              arguments: [ { field: 'a' } ]
            }
          ]
        }
      }
    ]
    try {
      transform(stack, { a: 123 }, { transforms: basicTransforms })
    } catch (err) {
      should.exist(err)
      should(err.message).eql('Argument "Text" for "Trim" must be of type: string, instead got number, date')
      done()
    }
  })
})

describe('paths', () => {
  it('should work on a basic object', () => {
    const res = paths({ a: 'b' })
    should(res).eql([
      { path: 'a', types: [ 'string' ] }
    ])
  })
  it('should work with arrays', () => {
    const res = paths({ a: [ 'b', 'c' ] })
    should(res).eql([
      { path: 'a', types: [ 'array' ] },
      { path: 'a.0', types: [ 'string' ] },
      { path: 'a.1', types: [ 'string' ] }
    ])
  })
  it('should work on a nested object', () => {
    const res = paths({ a: { b: { c: 123, d: 'yo' } }, z: 'text' })
    should(res).eql([
      { path: 'a', types: [ 'object' ] },
      { path: 'a.b', types: [ 'object' ] },
      { path: 'a.b.c', types: [ 'number', 'date' ] },
      { path: 'a.b.d', types: [ 'string' ] },
      { path: 'z', types: [ 'string' ] }
    ])
  })
  it('should work on a object with dot in the path', () => {
    const res = paths({ a: { 'b.c.d': 'yo' } })
    should(res).eql([
      { path: 'a', types: [ 'object' ] },
      { path: 'a.b\\.c\\.d', types: [ 'string' ] }
    ])
  })
  it('should work on a root geo object', () => {
    const res = paths(uas)
    should(res).eql(uasExpected)
  })
})


describe('analyze', () => {
  it('should work on a nested object', () => {
    const a = { a: { b: { c: 123, d: 'yo' } }, z: 'text', y: 'yo' }
    const b = { a: { b: { c: 'yo', d: 123 } }, z: 123, x: 'yo' }
    const res = analyze([ a, b ])
    should(res).eql([
      { path: 'a', types: [ 'object' ] },
      { path: 'a.b', types: [ 'object' ] },
      { path: 'a.b.c', types: [ 'number', 'date', 'string' ] },
      { path: 'a.b.d', types: [ 'string', 'number', 'date' ] },
      { path: 'z', types: [ 'string', 'number', 'date' ] },
      { path: 'y', types: [ 'string' ] },
      { path: 'x', types: [ 'string' ] }
    ])
  })
  it('should work on a big object', () => {
    const res = analyze(big)
    should(res).eql([
      { path: 'CALLTYPE', types: [ 'string' ] },
      { path: 'INCIDENT_NO', types: [ 'number', 'string' ] },
      { path: 'DATE', types: [ 'string', 'date' ] },
      { path: 'LOCATION', types: [ 'string', 'date', 'number' ] },
      { path: 'DISPO_CODE', types: [ 'number', 'string', 'date' ] },
      { path: 'CALLTYPE_DESC', types: [ 'string' ] }
    ])
  })
  it('should work on geo object items', () => {
    const res = analyze(uas.features)
    should(res).eql(featuresExpected)
  })
})
