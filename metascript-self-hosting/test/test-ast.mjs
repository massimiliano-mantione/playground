#external (describe, it)
#metaimport '../lib/macros'

var expect = (require "chai").expect

var Ast = require '../lib/ast'
var Symbol = require '../lib/symbol'

var sym1 = Symbol.create {id: "sym1"}
var sym2 = Symbol.create {id: "sym2"}
var sym-arg = Symbol.create {id: "sym-arg"}
var arg0 = new Ast sym-arg
var arg1 = new Ast sym-arg

describe
  "Ast"
  #->
    it
      "Can detect an ast node"
      #->
        var ast = new Ast()
        var o = {}
        expect(Ast.ast? ast).to.equal true
        expect(Ast.ast? o).to.equal false

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
      "Can be used with immutable macros"
      #->
        var ast1 = new Ast sym1
        var ast2 = (ast1..sym ..! sym2)
        expect(ast1..sym).to.equal sym1
        expect(ast2..sym).to.equal sym2
        var ast = ast2
        ast2..sym ..= sym1
        expect(ast == ast2).to.equal false
        expect(ast2..sym).to.equal sym1

    it
      "Handles arguments list through the 'at' method"
      #->
        var start = new Ast sym1
        var ast = start.at0 arg0
        expect(start.size).to.equal 0
        expect(ast.size).to.equal 1
        ast = ast.at1 arg1
        expect(ast.size).to.equal 2
        expect(ast.at 0).to.equal arg0
        expect(ast.at 1).to.equal arg1
        expect(ast.at1().sym).to.equal sym-arg

    it
      "Handles arguments list through the 'get' and 'set' methods"
      #->
        var start = new Ast sym1
        var ast = start.set (0, arg0)
        expect(start.size).to.equal 0
        expect(ast.size).to.equal 1
        ast = ast.set (1, arg1)
        expect(ast.size).to.equal 2
        expect(ast.get 0).to.equal arg0
        expect(ast.get 1).to.equal arg1
        expect(ast.get(1).sym).to.equal sym-arg

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
        expect(mutated.size).to.equal 2
        expect(mutated.at 0).to.equal arg0
        expect(mutated.at 1).to.equal arg1
        var last = mutated.as-immutable()
        expect(last == mutable).to.equal true
        expect(mutable.mutable?).to.equal false

    it
      "Supports the batch mutation API"
      #->
        var start = new Ast sym1
        var a1 = new Ast sym-arg
        var a2 = new Ast sym-arg
        var a3 = new Ast sym-arg
        var mutated = start.with-mutations #->
          #it.push a1
          #it.push a2
          #it.set-sym sym2
          #it.push a3
        expect(mutated.mutable?).to.equal false
        expect(mutated.sym).to.equal sym2
        expect(mutated.size).to.equal 3

    it
      "Looks like a List of args"
      #->
        var ast = new Ast sym1
        var a1 = new Ast sym-arg
        var a2 = new Ast sym-arg
        var a3 = new Ast sym-arg
        var keep = ast
        ast = ast.set (0, a1)
        expect(Ast.ast? ast).to.equal true
        expect(ast.size).to.equal 1
        ast = ast.set (1, a2)
        expect(Ast.ast? ast).to.equal true
        expect(ast.size).to.equal 2
        ast = ast.delete 0
        expect(ast.size).to.equal 1
        expect(ast.get 0).to.equal a2
        ast = ast.clear()
        expect(ast.size).to.equal 0
        ast = ast.push(a1, a2)
        expect(ast.size).to.equal 2
        ast = ast.push(a3)
        expect(ast.get 2).to.equal a3
        ast = ast.pop()
        expect(ast.size).to.equal 2
        expect(ast.first()).to.equal a1
        expect(ast.last()).to.equal a2
        ast = ast.unshift(a2, a1)
        expect(ast.size).to.equal 4
        expect(ast.first()).to.equal a2
        expect(ast.last()).to.equal a2
        ast = ast.clear()
        ast = ast.push(a1)
        ast = ast.update(0, #-> a2)
        expect(ast.get 0).to.equal a2
        ; I cannot make "not-set-value" work as expected
        ;ast = ast.update(1, a1, #-> #it)
        ;expect(ast.get 1).to.equal a1
        ;ast = ast.update(2, a3, #-> #it)
        ;expect(ast.get 2).to.equal a3
        ast = ast.set-size 0
        ast = ast.push(a1, a2)
        expect(ast.size).to.equal 2
        ast = ast.set-size 3
        expect(ast.size).to.equal 3
        expect(ast.get 2).to.equal undefined
        ast = ast.set-size 2
        expect(ast.has 1).to.equal true
        expect(ast.has 2).to.equal false
        expect(ast.contains a1).to.equal true
        expect(ast.contains a2).to.equal true
        expect(ast.contains a3).to.equal false
        ast = ast.set-in ([0], ast)
        ast = ast.set-in ([1], ast.get 0)
        expect(ast..[0]..[0]).to.equal a1
        expect(ast..[0]..[1]).to.equal a2
        expect(ast..[1]..[0]).to.equal a1
        expect(ast..[1]..[1]).to.equal a2
        ast..[0]..[0] ..= a3
        ast..[1]..[1] ..= a3
        expect(ast..[0]..[0]).to.equal a3
        expect(ast..[1]..[1]).to.equal a3
        keep = ast
        ast = ast.flatten (true)
        expect(ast.size).to.equal 4
        expect(ast..[0]).to.equal a3
        expect(ast..[3]).to.equal a3
        ast = ast.filter #-> #it != a3
        expect(ast.size).to.equal 2
        expect(ast..[0]).to.equal a2
        expect(ast..[1]).to.equal a1
        ast = keep
        ast = ast.flat-map (#-> #it.map (#-> a1))
        expect(ast.size).to.equal 4
        expect(ast..[0]).to.equal a1
        expect(ast..[1]).to.equal a1
        expect(ast..[2]).to.equal a1
        expect(ast..[3]).to.equal a1
        expect(ast.reduce (#-> #1 && (#2 == a1), true)).to.equal true
        expect(ast.every #-> #it == a1).to.equal true
        expect(ast.count()).to.equal 4
        expect((ast.count-by #-> #it.sym.id).size).to.equal 1
        expect((ast.count-by #-> #it.sym.id)..["sym-arg"]).to.equal 4
        ast = ast.clear()
        ast = ast.push(a1, a2)
        expect(ast.find #-> true).to.equal a1
        expect(ast.find-last #-> true).to.equal a2
        ast = ast.push ast
        expect(ast.max #-> #it.size).to.equal ast..[2]
        expect(ast.min #-> #it.size).to.equal a1
        expect(ast.index-of a2).to.equal 1
        expect(ast.last-index-of a2).to.equal 1
        expect(ast.find-index #-> #it == a2).to.equal 1
        expect(ast.find-last-index #-> #it == a2).to.equal 1
        ;ast = ast.pop()
        ;expect(ast.subset? ([a1, a2, a3])).to.equal true
        ;expect(ast.subset? ([a1])).to.equal false
        ;expect(ast.superSet? ([a1, a2, a3])).to.equal false
        ;expect(ast.superset? ([a1])).to.equal true
