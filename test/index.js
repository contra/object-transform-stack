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
  },
  sleepAdd: {
    name: 'Sleep Add',
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
    execute: async (a, b) =>
      new Promise((resolve) =>
        setTimeout(() => resolve(a + b), 500)
      )
  }
}

describe('transform', () => {
  it('should work on a basic object', async () => {
    const stack = {
      b: { field: 'a' }
    }
    const res = await transform(stack, { a: 'b' })
    should(res).eql({ b: 'b' })
  })
  it('should work on a dot prop to', async () => {
    const stack = {
      'a.data': { field: 'a' }
    }
    const res = await transform(stack, { a: 'b' })
    should(res).eql({ a: { data: 'b' } })
  })
  it('should work on a dot prop from', async () => {
    const stack = {
      'a.data': { field: 'a.result' }
    }
    const res = await transform(stack, { a: { result: 'b' } })
    should(res).eql({ a: { data: 'b' } })
  })
  it('should work on a missing attribute', async () => {
    const stack = {
      'a.data': { field: 'a.result' },
      'a.data2': { field: 'a.missing' }
    }
    const res = await transform(stack, { a: { result: 'b' } })
    should(res).eql({ a: { data: 'b', data2: undefined } })
  })
  it('should work on a missing attribute in strict mode', async () => {
    const stack = {
      'a.data': { field: 'a.result' },
      'a.data2': { field: 'a.missing' }
    }
    const res = await transform(stack, { a: { result: 'b' } }, { strict: true })
    should(res).eql({ a: { data: 'b', data2: null } })
  })
  it('should work on a missing attribute with default', async () => {
    const stack = {
      'a.data': { field: 'a.result' },
      'a.data2': { field: 'a.missing', defaultValue: 'c' }
    }
    const res = await transform(stack, { a: { result: 'b' } })
    should(res).eql({ a: { data: 'b', data2: 'c' } })
  })
  it('should work with a basic transform', async () => {
    const stack = {
      b: {
        transform: 'uppercase',
        arguments: [ { field: 'a' } ]
      }
    }
    const res = await transform(stack, { a: 'abc' }, { transforms: basicTransforms })
    should(res).eql({ b: 'ABC' })
  })
  it('should work with a basic transform and defaultValue on field', async () => {
    const stack = {
      'b': {
        transform: 'uppercase',
        arguments: [ { field: 'z', defaultValue: 'abc' } ]
      }
    }
    const res = await transform(stack, { a: 'abc' }, { transforms: basicTransforms })
    should(res).eql({ b: 'ABC' })
  })
  it('should work with a basic transform and defaultValue on transform', async () => {
    const stack = {
      'b': {
        transform: 'uppercase',
        defaultValue: 'XYZ',
        arguments: [ { field: 'z' } ]
      }
    }
    const res = await transform(stack, { a: 'abc' }, { transforms: basicTransforms })
    should(res).eql({ b: 'XYZ' })
  })
  it('should work with nested transforms', async () => {
    const stack = {
      'b': {
        transform: 'uppercase',
        arguments: [
          {
            transform: 'trim',
            arguments: [ { field: 'a' } ]
          }
        ]
      }
    }
    const res = await transform(stack, { a: '   abc   ' }, { transforms: basicTransforms })
    should(res).eql({ b: 'ABC' })
  })
  it('should work with flat value transforms', async () => {
    const stack = {
      'b': {
        transform: 'add',
        arguments: [
          { field: 'a' },
          123
        ]
      }
    }
    const res = await transform(stack, { a: 1 }, { transforms: basicTransforms })
    should(res).eql({ b: 124 })
  })
  it('should work with async transforms', async () => {
    const stack = {
      'b': {
        transform: 'sleepAdd',
        arguments: [
          { field: 'a' },
          123
        ]
      }
    }
    const res = await transform(stack, { a: 1 }, { transforms: basicTransforms })
    should(res).eql({ b: 124 })
  })
  it('should work with optional transform arguments', async () => {
    const stack = {
      area: {
        transform: 'simplifyGeometry',
        arguments: [
          { field: 'zone' }
        ]
      }
    }
    const res = await transform(stack, { zone: uas.features[0].geometry })
    should.exist(res.area)
  })
  it('should error with invalid transform values', async () => {
    const stack = {
      'b': {
        transform: 'uppercase',
        arguments: [
          {
            transform: 'trim',
            arguments: [ { field: 'a' } ]
          }
        ]
      }
    }
    try {
      await transform(stack, { a: 123 }, { transforms: basicTransforms })
    } catch (err) {
      should.exist(err)
      should(err.message).eql('Argument "Text" for "Trim" must be of type: string, instead got number')
      return
    }
    throw new Error('Did not throw!')
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
      { path: 'a.b.c', types: [ 'number' ] },
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
      { path: 'a.b.c', types: [ 'number', 'string' ] },
      { path: 'a.b.d', types: [ 'number', 'string' ] },
      { path: 'z', types: [ 'number', 'string' ] },
      { path: 'y', types: [ 'string' ] },
      { path: 'x', types: [ 'string' ] }
    ])
  })
  it('should work on a big object', () => {
    // convert dates ahead of time to test that
    const res = analyze(big.map((i) => ({
      ...i,
      DATE: new Date(i.DATE).toISOString()
    })))
    should(res).eql([
      { path: 'CALLTYPE', types: [ 'string' ] },
      { path: 'INCIDENT_NO', types: [ 'number', 'string' ] },
      { path: 'DATE', types: [ 'date', 'string' ] },
      { path: 'LOCATION', types: [ 'number', 'string' ] },
      { path: 'DISPO_CODE', types: [ 'number', 'string' ] },
      { path: 'CALLTYPE_DESC', types: [ 'string' ] }
    ])
  })
  it('should work on geo object items', () => {
    const res = analyze(uas.features)
    should(res).eql(featuresExpected)
  })
})
