/*eslint no-console: 0*/

import should from 'should'
import { transform } from '../src'

describe('transform', () => {
  it('should work on a basic object', () => {
    const stack = [
      { to: 'b', from: 'a' }
    ]
    const res = transform(stack, { a: 'b' })
    should(res).eql({ b: 'b' })
  })
  it('should work on a dot prop to', () => {
    const stack = [
      { to: 'a.data', from: 'a' }
    ]
    const res = transform(stack, { a: 'b' })
    should(res).eql({ a: { data: 'b' } })
  })
  it('should work on a dot prop from', () => {
    const stack = [
      { to: 'a.data', from: 'a.result' }
    ]
    const res = transform(stack, { a: { result: 'b' } })
    should(res).eql({ a: { data: 'b' } })
  })
  it('should work on a missing attribute', () => {
    const stack = [
      { to: 'a.data', from: 'a.result' },
      { to: 'a.data2', from: 'a.missing' }
    ]
    const res = transform(stack, { a: { result: 'b' } })
    should(res).eql({ a: { data: 'b', data2: undefined } })
  })
  it('should work on a missing attribute in strict mode', () => {
    const stack = [
      { to: 'a.data', from: 'a.result' },
      { to: 'a.data2', from: 'a.missing' }
    ]
    const res = transform(stack, { a: { result: 'b' } }, { strict: true })
    should(res).eql({ a: { data: 'b', data2: null } })
  })
  it('should work with multiple stack items that override eachother', () => {
    const stack = [
      { to: 'b', from: 'a' },
      { to: 'b', from: 'c' }
    ]
    const res = transform(stack, { a: 'b', c: 'c' })
    should(res).eql({ b: 'c' })
  })
  it('should work with a transform', () => {
    const transforms = {
      parseInt
    }
    const stack = [
      { to: 'b', from: 'a', transforms: [ 'parseInt' ] }
    ]
    const res = transform(stack, { a: '123' }, { transforms })
    should(res).eql({ b: 123 })
  })
  it('should work with mutiple transforms', () => {
    const transforms = {
      parseInt,
      minusOne: (v) => v - 1
    }
    const stack = [
      { to: 'b', from: 'a', transforms: [ 'parseInt', 'minusOne' ] }
    ]
    const res = transform(stack, { a: '123' }, { transforms })
    should(res).eql({ b: 122 })
  })
})
