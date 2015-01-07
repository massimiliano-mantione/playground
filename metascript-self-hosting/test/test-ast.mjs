#external (describe, it)

var expect = (require "chai").expect

var Ast = require '../lib/ast'
var Symbol = require '../lib/symbol'

var sym1 = Symbol.create {id: "sym1"}
var sym2 = Symbol.create {id: "sym2"}
var sym-arg = Symbol.create {id: "sym-arg"}
var arg0 = new Ast sym-arg
var arg1 = new Ast sym-arg

describe
  "Ast node"
  #->
    it
      "By default is created immutable"
      #->
        var ast = new Ast()
        expect(ast.mutable?).to.equal false

    it
      "Can be handled as an immutable record"
      #->
        var ast1 = new Ast sym1
        var ast2 = ast1.set-sym sym2
        expect(ast1.sym).to.equal sym1
        expect(ast2.sym).to.equal sym2

    it
      "Has the same API as an immutable record"
      #->
        var ast1 = new Ast sym1
        var ast2 = ast1.set ("sym", sym2)
        expect(ast1.get "sym").to.equal sym1
        expect(ast2.get "sym").to.equal sym2

    it
      "Handles arguments list"
      #->
        var start = new Ast sym1
        var ast = start.at0 arg0
        expect(start.args.size).to.equal 0
        expect(ast.args.size).to.equal 1
        ast = ast.at1 arg1
        expect(ast.args.size).to.equal 2
        expect(ast.at 0).to.equal arg0
        expect(ast.at 1).to.equal arg1
        expect(ast.at1().sym).to.equal sym-arg
;
    it
      "Can be made mutable"
      #->
        var start = new Ast sym1
        var mutable = start.as-mutable()
        expect(start == mutable).to.equal false
        expect(mutable.mutable?).to.equal true
        var mutated = mutable
        mutated = mutated.set-sym sym2
        mutated = mutated.at0 arg0
        mutated = mutated.at1 arg1
        expect(mutated == mutable).to.equal true
        expect(mutated.args.size).to.equal 2
        expect(mutated.at 0).to.equal arg0
        expect(mutated.at 1).to.equal arg1
        var last = mutated.as-immutable()
        expect(last == mutable).to.equal true
        expect(mutable.mutable?).to.equal false
