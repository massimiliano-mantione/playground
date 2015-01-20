#external (describe, it)
#metaimport '../lib/macros'

var expect = (require "chai").expect

var Ast = require '../lib/ast'
var Parser = require '../lib/parser'

describe
  "Parser"
  #->
    it
      "Can load a string of source code and iterate its lines"
      #->
        var p = Parser()
        expect(p.source.size).to.equal 0
        p.load-string <=.. 'my\nsource\ncode'
        expect(p.source.to-array()).to.eql(['my', 'source', 'code'])
        expect(p.current-line).to.equal 0
        expect(p.current-column).to.equal 0
        p..current-column ..= 1
        expect(p.current-column).to.equal 1
        expect(p.done?).to.equal false
        expect(p.line-done?).to.equal false
        p..current-column ..= 2
        expect(p.line-done?).to.equal true
        p = p.next-line()
        p = p.next-line()
        expect(p.line-done?).to.equal false
        p = p.next-line()
        expect(p.done?).to.equal true

    it
      "Gives an error when attempting to load a non existent file"
      #->
        var p = Parser()
        p.load-file <=.. 'my\nsource\ncode'
        expect(p.has-errors).to.eql true
        expect(p.errors..[0].message.index-of "no such file" >= 0).to.eql true
