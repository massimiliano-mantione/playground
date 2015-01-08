#external (describe, it)
#metaimport '../lib/macros'

var expect = (require "chai").expect

var Ast = require '../lib/ast'
var Symbol = require '../lib/symbol'
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
