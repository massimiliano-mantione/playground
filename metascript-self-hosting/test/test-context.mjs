#external (describe, it)
#metaimport '../lib/macros'

var expect = (require "chai").expect

var Ast = require '../lib/ast'
var Context = require '../lib/context'

describe
  "Context"
  #->
    it
      "Can detect a Context instance"
      #->
        var ctx = Context.create()
        var o = {}
        expect(Context.ctx? ctx).to.equal true
        expect(Context.ctx? o).to.equal false

    it
      "Aways creates a different context"
      #->
        var c1 = Context.create()
        var c2 = Context.create()
        expect(c1 == c2).to.equal false
