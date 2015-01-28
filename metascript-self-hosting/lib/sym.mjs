#external module

var Immutable = require 'immutable'
var Ast = require './ast'

var no-op = (ast, ctx) -> ast
var transform-args = (ast, ctx) -> ast



var Sym = Immutable.Record {
  id: ":error"

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
  ; Quoted string start (val is the delimiter)
  ":qs": Sym {
      id: ":qs"
    }
  ; Quoted string chunk (val is the chunk)
  ":str": Sym {
      id: ":str"
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
  "hblk": Sym {
      id: "()"
    }
  "vblk": Sym {
      id: "()"
    }
}


module.exports = Sym
