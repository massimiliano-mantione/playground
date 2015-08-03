#external module

var Immutable = require 'immutable'
var Ast = require './ast'

var no-op = (ast, ctx) -> ast
var transform-args = (ast, ctx) -> ast



var Sym = Immutable.Record {
  id: ":error"
  block: null

}

Sym.error = Sym()

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
  ":op": Sym {
      id: ":op"
    }

  ; The following tokens are produced by the parser
  ; but they are eliminated by the grouping pass
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
  ",": Sym {
      id: ","
    }
  ; Line start (val is the indentation level)
  ":l": Sym {
      id: ":l"
    }
  ; String literal start (val is the delimiter)
  ":sls": Sym {
      id: ":sls"
    }
  ; String literal chunk (val is the chunk)
  ":str": Sym {
      id: ":str"
    }
  ":doc": Sym {
      id: ":doc"
    }

  ; The following tokens are produced by the grouping pass
  "()": Sym {
      id: "()"
    }
  "[]": Sym {
      id: "[]"
    }
  "{}": Sym {
      id: "{}"
    }
  "vblk": Sym {
      id: "(|)"
    }
  "lblk": Sym {
      id: "(,)"
    }
  "hblk": Sym {
      id: "(#)"
    }
}


module.exports = Sym
