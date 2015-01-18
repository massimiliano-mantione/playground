#external (describe, it, before-each)
#metaimport "../lib/macros"

var expect = (require "chai").expect
var Immutable = require 'immutable'

var Ast = require '../lib/ast'
var Symbol = require '../lib/symbol'
var Context = require '../lib/context'

var R = Immutable.Record {
  p1: "p1"
  p2: "p2"
  deep: null
}
R.prototype.mp1 = v -> this.set ("p1", v)
R.prototype.mp2 = v -> this.set ("p2", v)

describe
  'Macros for Immutable'
  #-> do!
    var (m1, m2, m3, v)

    before-each #->
      m1 = Immutable.Map {a:1, b:2, c:3, d:4}
      m2 = Immutable.fromJS {a:{b:42}}
      m3 = Immutable.fromJS {a:{b:{c:[3,4,5]}}}
      v = Immutable.List([1, 2, 3])

    it
      'Can get a map property'
      #-> expect(m1..a).to.equal 1

    it
      'Can get into a map property'
      #-> expect(m2..a..b).to.equal 42

    it
      'Can get a vector element'
      #-> expect(v..[0]).to.equal 1

    it
      'Can set a map property'
      #->
        var m = (m1..a ..! 42)
        expect(m..a).to.equal 42
        expect(m1..a).to.equal 1
        m1..a ..= 42
        expect(m1..a).to.equal 42

    it
      'Can set into a map property'
      #->
        var m = (m2..a..b ..! 0)
        expect(m..a..b).to.equal 0
        expect(m2..a..b).to.equal 42
        m2..a..b ..= 0
        expect(m2..a..b).to.equal 0

    it
      'Can update a map property'
      #->
        var m = (m1..a ..!> #-> #it + 41)
        expect(m..a).to.equal 42
        m1..a ..=> #-> #it + 41
        expect(m1..a).to.equal 42

    it
      'Can update into a map property'
      #->
        var m = (m2..a..b ..!> #-> #it / 2)
        expect(m..a..b).to.equal 21
        m2..a..b ..=> #-> #it / 2
        expect(m2..a..b).to.equal 21

    it
      'Can invoke a mutating method'
      #->
        var r = R()
        r..deep ..= R()
        r..deep..deep ..= R()
        var res
        res = (r..mp1 <.. "v1")
        expect(res..p1).to.equal "v1"
        res = (r..deep..mp2 <.. "v2")
        expect(res..deep..p2).to.equal "v2"
        res = (r..deep..deep..mp1 <.. "v")
        expect(res..deep..deep..p1).to.equal "v"


describe
  'Context [un]wrapping macros'
  #-> do!
    var (ctx, original-ctx, other-ctx, ast, result)

    before-each #->
      original-ctx = Context.create()
      ctx = Context.create()
      other-ctx = Context.create()
      ast = new Ast()

    it
      'Unwraps an ast'
      #->
        result = #unwrap ast
        expect(result == ast).to.equal true

    it
      'Unwraps a ctx'
      #->
        result = #unwrap other-ctx
        expect(result == null).to.equal true
        expect(ctx == other-ctx).to.equal true

    it
      'Unwraps a wrapper'
      #->
        var w = (other-ctx.wrap ast)
        expect(w.ctx == other-ctx).to.equal true
        expect(w.ast == ast).to.equal true
        result = #unwrap (w)
        expect(result == ast).to.equal true
        expect(ctx == other-ctx).to.equal true

    it
      'Wraps an ast with unchanged context as itself'
      #->
        ctx = original-ctx
        result = #wrap ast
        expect(result == ast).to.equal true
        expect(ctx == original-ctx).to.equal true

    it
      'Wraps an ast with changed context'
      #->
        result = #wrap ast
        expect(Context.wrapper? result).to.equal true
        expect(result.ast == ast).to.equal true
        expect(result.ctx == ctx).to.equal true

    it
      'Wraps a null ast with unchanged context as null'
      #->
        ctx = original-ctx
        result = #wrap null
        expect(result == null).to.equal true
        expect(ctx == original-ctx).to.equal true

    it
      'Wraps a null ast with changed context'
      #->
        ctx = other-ctx
        result = #wrap null
        expect(Context.wrapper? result).to.equal true
        expect(result.ast == null).to.equal true
        expect(result.ctx == ctx).to.equal true

    it
      'Wraps an [ast] with unchanged context as itself'
      #->
        ctx = original-ctx
        result = #wrap [ast]
        expect(result.constructor == Array).to.equal true
        expect(result[0] == ast).to.equal true
        expect(ctx == original-ctx).to.equal true

    it
      'Wraps an [ast] with changed context'
      #->
        result = #wrap [ast]
        expect(Context.wrapper? result).to.equal true
        expect(result.ast.constructor == Array).to.equal true
        expect(result.ast[0] == ast).to.equal true
        expect(result.ctx == ctx).to.equal true
