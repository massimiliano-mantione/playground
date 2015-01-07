#external module

var Immutable = require 'immutable'

var no-op = (ast, ctx) -> ast
var transform-args = (ast, ctx) -> ast


var Symbol = Immutable.Record {
  id: ':error'

}

Symbol.create = props -> new Symbol props

module.exports = Symbol
