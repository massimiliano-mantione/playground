#external (describe, it)
#metaimport '../lib/macros'

var expect = (require "chai").expect

var Msg = require '../lib/msg'
var Ast = require '../lib/ast'
var Symbol = require '../lib/symbol'

var sym = Symbol.create {id: "sym"}
var node-at = (src, ls, cs, org, lo, co) -> new Ast
  sym
  null
  undefined
  src
  ls
  ls
  cs
  cs + 1
  if org org else src
  if lo lo else ls
  if lo lo else ls
  if co co else cs
  if co (co + 1) else (cs + 1)


describe
  "Msg"
  #->
    it
      "Can be created at a location"
      #->
        var m = Msg.create-at ("msg", "src", 42, 12, 3)
        expect(m.message).to.equal "msg"
        expect(m.source).to.equal "src"
        expect(m.column-to).to.equal 15

    it
      "Can be created from an ast node"
      #->
        var ast = node-at ("src", 42, 12)
        expect(ast.has-expansion-location()).to.equal false
        var m = Msg.from-ast (ast, "msg")
        expect(m.message).to.equal "msg"
        expect(m.source).to.equal "src"
        expect(m.column-to).to.equal 13

    it
      "Can be created from an expanded ast node"
      #->
        var ast = node-at ("src", 42, 12, "org", 420, 120)
        expect(ast.has-expansion-location()).to.equal true
        var m = Msg.from-ast (ast, "msg")
        expect(m.message).to.equal "msg"
        expect(m.source).to.equal "src"
        expect(m.column-to).to.equal 13
        expect(m.details.size).to.equal 1
        var m2 = m.details.get 0
        expect(m2.message.index-of("xpanded from") >= 0).to.equal true
        expect(m2.source).to.equal "org"
        expect(m2.column-to).to.equal 121
