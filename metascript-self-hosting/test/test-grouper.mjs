#external (describe, it, before-each)
#metaimport '../lib/macros'

var expect = (require "chai").expect

var Ast = require '../lib/ast'
var Parser = require '../lib/parser'
var grouper = require '../lib/grouper'

var test-grouper = (
    source
    expected-ast
    expected-errors
  ) ->
    if (expected-errors == undefined)
      expected-errors = []
    var parser = Parser()
    parser.load-string <=.. source
    console.log ("LOADED:\n" + source + "---")
    parser.tokenize-source <=.. ()
    var g = grouper parser.root
    console.log ("GOT:\n" + g.ast.array-dump() + "---")
    expect(g.ast.array-dump()).to.eql(expected-ast)
    expected-errors.for-each (expected-error) -> do!
      var found = false
      g.errors.for-each #-> do!
        if (#it.message.index-of expected-error.message >= 0)
          found = true
      if (!found)
        throw new Error ('Expected error: ' + expected-error.message)
    g.errors.for-each (error) -> do!
      var found = false
      expected-errors.for-each (expected-error) -> do!
        if (error.message.index-of expected-error.message >= 0)
          found = true
      if (!found)
        throw new Error ('Unexpected error: ' + error.message)
    expect(g.errors.length).to.eql(expected-errors.length)

describe.only
  "Grouper"
  #->
    var p

    before-each #-> do!
      p = Parser()

    it
      'Can parse and group an empty string'
      #->
        test-grouper
          ""
          [':root']

    it
      'Can group a single line'
      #->
        test-grouper
          "a b c"
          [':root', [['(|)', [
            ['(-)', [
              [':tag', 'a']
              [':tag', 'b']
              [':tag', 'c']
            ]]
          ]]]]

    it
      'Can group multiple lines'
      #->
        test-grouper
          "".concat
            "a b c\n"
            "d\n"
            "e f\n"
          [':root', [['(|)', [
            ['(-)', [
              [':tag', 'a']
              [':tag', 'b']
              [':tag', 'c']
            ]]
            ['(-)', [
              [':tag', 'd']
            ]]
            ['(-)', [
              [':tag', 'e']
              [':tag', 'f']
            ]]
          ]]]]

    it
      'Can group parenthesis'
      #->
        test-grouper
          "(a b)"
          [':root', [['(|)', [['(-)', [
            ['()', [
              [',', [[':tag', 'a'], [':tag', 'b']]]
            ]]
          ]]]]]]

    it
      'Can group more parenthesis'
      #->
        test-grouper
          "a (b, c d, e f g) (h i)"
          [':root', [['(|)', [['(-)', [
            [':tag', 'a']
            ['()', [
              [',', [[':tag', 'b']]]
              [',', [[':tag', 'c'], [':tag', 'd']]]
              [',', [[':tag', 'e'], [':tag', 'f'], [':tag', 'g']]]
            ]]
            ['()', [
              [',', [[':tag', 'h'], [':tag', 'i']]]
            ]]
          ]]]]]]

    it
      'Detects mismatched parenthesis'
      #->
        test-grouper
          "([a)]"
          [':root', [['(|)', [['(-)', [
            ['()', [[',', [
              ['[]', [[',', [
                [':tag', 'a']
              ]]]]
            ]]]]
          ]]]]]]
          [
            {message: "ismatched"}
            {message: "issing close"}
          ]

    it
      'Detects open blocks'
      #->
        test-grouper
          "(a" ;)
          [':root', [['(|)', [['(-)', [
            ['()', [[',', [
              [':tag', 'a']
            ]]]]
          ]]]]]]
          [
            {message: "issing close"}
          ]

    it
      'Nests indented blocks'
      #->
        test-grouper
          "".concat
            "a\n"
            "  b c\n"
            "    d\n"
            "    e f\n"
            "  g"
          [':root', [['(|)',
            [['(-)', [[':tag', 'a'],
              ['(|)',[
                ['(-)', [
                  [':tag', 'b']
                  [':tag', 'c']
                  ['(|)', [
                    ['(-)', [[':tag', 'd']]]
                    ['(-)', [[':tag', 'e'], [':tag', 'f']]]
                  ]]
                ]]
                ['(-)', [[':tag', 'g']]]
              ]]
            ]]]
          ]]]

    it
      'Allows indentation inside parenthesis'
      #->
        test-grouper
          "".concat
            "(\n"
            "  b c\n"
            "    d\n"
            "    e f\n"
            "  g\n"
            ")"
          [':root', [['(|)',[['(-)', [['()', [
            ['(|)',[
              ['(-)', [
                [':tag', 'b']
                [':tag', 'c']
                ['(|)', [
                  ['(-)', [[':tag', 'd']]]
                  ['(-)', [[':tag', 'e'], [':tag', 'f']]]
                ]]
              ]]
              ['(-)', [[':tag', 'g']]]
            ]]
          ]]]]]]]]
