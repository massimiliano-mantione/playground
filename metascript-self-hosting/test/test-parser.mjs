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
        expect(p.source-empty?).to.equal true
        p.load-string <=.. "my\nsource\ncode"
        expect(p.source-empty?).to.equal false
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
        p.load-file <=.. "my\nsource\ncode"
        expect(p.has-errors).to.eql true
        expect(p.errors..[0].message.index-of "no such file" >= 0).to.eql true

    it
      "Handles comments"
      #->
        p.load-string <=.. "".concat
          "; I am a comment\n"
          "  abc\n"
          "  def ; I am another comment\n"
          "  ; I am an indented comment\n"
          "  ghi"
        p.tokenize-source <=.. ()
        expect(p.root.array-dump()).to.eql([':root',
          [ [ ':l', 0 ],
            [ ':l', 2 ],
            [ ':tag', 'abc' ],
            [ ':l', 2 ],
            [ ':tag', 'def' ],
            [ ':l', 2 ],
            [ ':l', 2 ],
            [ ':tag', 'ghi' ] ] ])

    it
      "Handles docs"
      #->
        p.load-string <=.. "".concat
          ";;; I am a doc\n"
          ";;;\n"
          "  abc\n"
          "  def ; I am another comment\n"
          "  ;;;;;\n"
          "  I am an indented doc\n"
          "  and I have a second line\n"
          "  and a third;;;;\n"
          "  ghi\n"
          ";;;;; I am a stranger doc\n"
          ";;;;; I go on\n"
          "and I ;;; doc ;;; myself\n"
          ";;;; for real ;;;\n"
          ";;;\n"
          "  jkl"
        p.tokenize-source <=.. ()
        expect(p.root.array-dump()).to.eql([':root',
          [ [ ':l', 0 ],
            [ ':doc', " I am a doc" ],
            [ ':l', 2 ],
            [ ':tag', 'abc' ],
            [ ':l', 2 ],
            [ ':tag', 'def' ],
            [ ':l', 2 ],
            [ ':doc', "  I am an indented doc" ],
            [ ':doc', "  and I have a second line" ],
            [ ':doc', "  and a third" ],
            [ ':l', 2 ],
            [ ':tag', 'ghi' ],
            [ ':l', 0 ],
            [ ':doc', " I am a stranger doc" ],
            [ ':doc', ";;;;; I go on" ],
            [ ':doc', "and I ;;; doc ;;; myself" ],
            [ ':doc', ";;;; for real ;;;" ],
            [ ':l', 2 ],
            [ ':tag', 'jkl' ] ] ])

    it
      "Can tokenize tags"
      #->
        p.load-string <=.. "my source code"
        p.tokenize-source <=.. ()
        expect(p.root.array-dump()).to.eql([':root',
          [ [ ':l', 0 ],
            [ ':tag', 'my' ],
            [ ':tag', 'source' ],
            [ ':tag', 'code' ] ] ])

    it
      "Can tokenize numbers"
      #->
        p.load-string <=.. "numbers 1 2 3.5 123.456e-3 123.456e11"
        p.tokenize-source <=.. ()
        expect(p.root.array-dump()).to.eql([':root',
          [ [ ':l', 0 ],
            [ ':tag', 'numbers' ],
            [ ':val', 1 ],
            [ ':val', 2 ],
            [ ':val', 3.5 ],
            [ ':val', 123.456e-3 ],
            [ ':val', 123.456e11 ] ] ])

    it
      "Can tokenize empty strings"
      #->
        p.load-string <=.. "1 \"\" 2 '' 3"
        p.tokenize-source <=.. ()
        expect(p.root.array-dump()).to.eql([':root',
          [ [ ':l', 0 ],
            [ ':val', 1 ],
            [ ':val', "" ],
            [ ':val', 2 ],
            [ ':val', "" ],
            [ ':val', 3 ] ] ])

    it
      "Can tokenize simple strings"
      #->
        p.load-string <=.. "1 \"abc\" 2 'def' 3"
        p.tokenize-source <=.. ()
        expect(p.root.array-dump()).to.eql([':root',
          [ [ ':l', 0 ],
            [ ':val', 1 ],
            [ ':sls', "\"" ],
            [ ':str', "abc" ],
            [ ':val', 2 ],
            [ ':sls', "'" ],
            [ ':str', "def" ],
            [ ':val', 3 ] ] ])

    it
      "Can tokenize multiline interpolated strings"
      #->
        p.load-string <=.. "".concat
          "1 \"\"\"abcdef\n"
          "     ghijkl\n"
          "     zz\tz\x2Fzz\123z\u0AFAzz\n"
          "     mnopqr\n"
          "stuvwx\n"
          "  \"\"\" 2"
        p.tokenize-source <=.. ()
        expect(p.root.array-dump()).to.eql([':root',
          [ [ ':l', 0 ],
            [ ':val', 1 ],
            [ ':sls', "\"\"\"" ],
            [ ':str', "abcdef" ],
            [ ':str', " ghijkl" ],
            [ ':str', " zz\tz\x2Fzz\123z\u0AFAzz" ],
            [ ':str', " mnopqr" ],
            [ ':str', "stuvwx" ],
            [ ':val', 2 ] ] ])

    it
      "Can tokenize multiline literal strings"
      #->
        p.load-string <=.. "".concat
          "1 '''abcdef\n"
          "     ghijkl\n"
          "     mnopqr\n"
          "stuvwx\n"
          "  ''' 2"
        p.tokenize-source <=.. ()
        expect(p.root.array-dump()).to.eql([':root',
          [ [ ':l', 0 ],
            [ ':val', 1 ],
            [ ':sls', "'''" ],
            [ ':str', "abcdef\n" ],
            [ ':str', "     ghijkl\n" ],
            [ ':str', "     mnopqr\n" ],
            [ ':str', "stuvwx\n" ],
            [ ':str', "  " ],
            [ ':val', 2 ] ] ])

    it
      "Produces source location info"
      #->
        p.load-string <=.. "a 12\n  b cde"
        p.tokenize-source <=.. ()
        expect(p.root.array-dump()).to.eql([':root',
          [ [ ':l', 0 ],
            [ ':tag', 'a' ],
            [ ':val', 12 ],
            [ ':l', 2 ],
            [ ':tag', 'b' ],
            [ ':tag', 'cde' ] ] ])
        expect(p.root.args.map(#-> #it.loc.actual.line-from).to-array()).to.eql
          ([1, 1, 1, 2, 2, 2])
        expect(p.root.args.map(#-> #it.loc.actual.line-to).to-array()).to.eql
          ([1, 1, 1, 2, 2, 2])
        expect(p.root.args.map(#-> #it.loc.actual.column-from).to-array()).to.eql
          ([1, 1, 3, 1, 3, 5])
        expect(p.root.args.map(#-> #it.loc.actual.column-to).to-array()).to.eql
          ([1, 2, 5, 3, 4, 8])
        expect(p.root.args.some(#-> #it.loc.actual != #it.loc.original)).to.equal false
