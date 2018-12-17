# object-transform-stack [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url]


## Install

```
npm install object-transform-stack --save
```

## Usage

```js
import { transform } from 'object-transform-stack'

const transforms = {
  date: (v) => new Date(v)
}

const stack = [
  { to: 'bday', from: 'birth', transforms: [ 'date' ] },
  { to: 'name', from: 'name.legal' }
]

const input = {
  name: {
    legal: 'Don Adams',
    preferred: 'Donny'
  },
  birth: '11/12/27'
}

console.log(transform(stack, input, { transforms }))
/*
Prints:

{
  "bday": "2027-11-12T05:00:00.000Z",
  "name": "Don Adams"
}
*/
```

[downloads-image]: http://img.shields.io/npm/dm/object-transform-stack.svg
[npm-url]: https://npmjs.org/package/object-transform-stack
[npm-image]: http://img.shields.io/npm/v/object-transform-stack.svg

[travis-url]: https://travis-ci.org/staeco/object-transform-stack
[travis-image]: https://travis-ci.org/staeco/object-transform-stack.png?branch=master
