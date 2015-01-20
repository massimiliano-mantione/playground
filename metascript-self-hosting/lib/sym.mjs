#external module

var Immutable = require 'immutable'
var Ast = require './ast'

var no-op = (ast, ctx) -> ast
var transform-args = (ast, ctx) -> ast



var Sym = Immutable.Record {
  id: ":error"

}

Sym.create = props -> Sym props

Sym.tokens = {
  ":root": Sym {
      id: ":root"
    }
  ":tag": Sym {
      id: ":tag"
    }
  ":val": Sym {
      id: ":val"
    }
  ":string-chunk": Sym {
      id: ":string-chunk"
    }
  ":op": Sym {
      id: ":op"
    }
  ":line": Sym {
      id: ":line"
    }
  "(": Sym {
      id: "("
    }
  ")": Sym {
      id: ")"
    }
  "[": Sym {
      id: "["
    }
  "]": Sym {
      id: "]"
    }
  "{": Sym {
      id: "{"
    }
  "}": Sym {
      id: "}"
    }

}


module.exports = Sym
