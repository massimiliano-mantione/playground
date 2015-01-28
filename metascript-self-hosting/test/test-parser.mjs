#external (describe, it, before-each)
#metaimport '../lib/macros'

var expect = (require "chai").expect

var Ast = require '../lib/ast'
var Parser = require '../lib/parser'

describe
  "Parser"
  #->
    var p

    before-each #-> do!
      p = Parser()

    it
      "Can load a string of source code and iterate its lines"
      #->
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
        p.load-file <=.. 'my\nsource\ncode'
        expect(p.has-errors).to.eql true
        expect(p.errors..[0].message.index-of "no such file" >= 0).to.eql true

    it
      "Can tokenize tags"
      #->
        p.load-string <=.. 'my source code'
        p.tokenize-source <=.. ()
        expect(p.root.array-dump()).to.eql([':root',
          [ [ ':l', 0 ],
            [ ':tag', 'my' ],
            [ ':tag', 'source' ],
            [ ':tag', 'code' ] ] ])

    it
      "Can tokenize numbers"
      #->
        expect(p.source-empty?).to.equal true
        expect(p.root.size).to.equal 0
        p.load-string <=.. 'numbers 1 2 3.5 123.456e-3 123.456e11'
        p.tokenize-source <=.. ()
        expect(p.root.array-dump()).to.eql([':root',
          [ [ ':l', 0 ],
            [ ':tag', 'numbers' ],
            [ ':val', 1 ],
            [ ':val', 2 ],
            [ ':val', 3.5 ],
            [ ':val', 0.123456 ],
            [ ':val', 12345600000000 ] ] ])
