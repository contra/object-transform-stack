'use strict';

exports.__esModule = true;

var _analyze = require('./analyze');

Object.defineProperty(exports, 'analyze', {
  enumerable: true,
  get: function () {
    return _analyze.analyze;
  }
});
Object.defineProperty(exports, 'paths', {
  enumerable: true,
  get: function () {
    return _analyze.paths;
  }
});

var _apply = require('./apply');

Object.defineProperty(exports, 'transform', {
  enumerable: true,
  get: function () {
    return _apply.transform;
  }
});