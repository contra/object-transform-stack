"use strict";

exports.__esModule = true;
exports.transform = exports.paths = exports.analyze = void 0;

var _analyze = require("./analyze");

exports.analyze = _analyze.analyze;
exports.paths = _analyze.paths;

var _apply = require("./apply");

exports.transform = _apply.transform;