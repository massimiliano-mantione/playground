#external module

var Immutable = require 'immutable'

var no-op = (ast, ctx) -> ast
var transform-args = (ast, ctx) -> ast


var Symbol = Immutable.Record {
  id: ':error'

}

Symbol.create = props -> Symbol props

Symbol.tokens = {
  ":root": Symbol {
      id: ":root"
    }
  ":tag": Symbol {
      id: ":tag"
    }
  ":val": Symbol {
      id: ":val"
    }
  ":string-chunk": Symbol {
      id: ":string-chunk"
    }
  ":op": Symbol {
      id: ":op"
    }
  ":indent": Symbol {
      id: ":indent"
    }
  "(": Symbol {
      id: "("
    }
  ")": Symbol {
      id: ")"
    }
  "[": Symbol {
      id: "["
    }
  "]": Symbol {
      id: "]"
    }
  "{": Symbol {
      id: "{"
    }
  "}": Symbol {
      id: "}"
    }

}

module.exports = Symbol
