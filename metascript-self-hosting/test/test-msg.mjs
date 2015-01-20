#external (describe, it)
#metaimport '../lib/macros'

var expect = (require "chai").expect

var Msg = require '../lib/msg'
var Ast = require '../lib/ast'
var Loc = require '../lib/loc'
var Sym = require '../lib/sym'

var sym = Sym.create {id: "sym"}
var location-at = (src, l, c) -> Loc.Location {
  source: src
  line-from: l
  line-to: l
  column-from: c
  column-to: c + 1
}

var node-at = (actual, original) -> Ast
  sym
  null
  undefined
  undefined
  Loc {
      actual: actual
      original:
        if (typeof original != 'undefined') original
        else actual
    }


describe
  "Msg"
  #->
    it
      "Can be created at a location"
      #->
        var m = Msg.from-location ("msg", location-at("src", 42, 12))
        expect(m.message).to.equal "msg"
        expect(m.source).to.equal "src"
        expect(m.column-to).to.equal 13

    it
      "Can be created from an ast node"
      #->
        var ast = node-at location-at(("src", 42, 12))
        expect(ast.loc.has-expansion-data).to.equal false
        expect(ast.loc.actual.source).to.equal "src"
        expect(ast.loc.actual.line-from).to.equal 42
        expect(ast.loc.actual.line-to).to.equal 42
        expect(ast.loc.actual.column-from).to.equal 12
        expect(ast.loc.actual.column-to).to.equal 13
        expect(ast.loc.actual).to.equal ast.loc.original
        var m = Msg.from-ast (ast, "msg")
        expect(m.message).to.equal "msg"
        expect(m.source).to.equal "src"
        expect(m.column-to).to.equal 13

    it
      "Can be created from an expanded ast node"
      #->
        var ast = node-at
          location-at("src", 42, 12)
          location-at("org", 420, 120)
        expect(ast.loc.has-expansion-data).to.equal true
        var m = Msg.from-ast (ast, "msg")
        expect(m.message).to.equal "msg"
        expect(m.source).to.equal "src"
        expect(m.column-to).to.equal 13
        expect(m.details.size).to.equal 1
        var m2 = m.details.get 0
        expect(m2.message.index-of("xpanded from") >= 0).to.equal true
        expect(m2.source).to.equal "org"
        expect(m2.column-to).to.equal 121
