#external module
#metaimport '../lib/macros'

var Immutable = require 'immutable'
var Sym = require "./sym"

;new-token = (sym, val, src, line, column, length) ->


var try-match = (string, pattern) ->
  var m = string.match(pattern);
  if (m != null)
    m[0]
  else
    ""

var consume-chars = (n, string) ->
  if (typeof n == 'undefined')
    n = 1
  string = string.substring n
  if (string == null) ""
  else string



var tokenizers = Immutable.Map()

; Each tokenizer function takes a Parser as input, expecting that both the
; done? and line-done? proprerties are false (it should not check for it).
; It is expected to return a mutated parser where the current column has
; advanced or errors have been generated (or both), and tokens could have
; been appended to the ast root.

var tag-pattern = new RegExp "^([-][\>]?)*[_$a-zA-Z\xA0-\uFFFF]([_$a-zA-Z0-9\xA0-\uFFFF]|([-][\>]?))*[\!\?]*"
var number-base-pattern = new RegExp "^[0-9]*\\.?[0-9]+"
var number-exponent-pattern = new RegExp "^[eE][\-+]?[0-9]+"
var hash-operator-pattern = new RegExp "^\#([-][\>]?)*([\#_$a-zA-Z0-9\xA0-\uFFFF]|([-][\>]?))*[\!\?]*"
var operator-pattern = new RegExp "^[\\\+\*\-\/<>\:\~\|\^\#\@\!\?\&\\.\=\~\`\%]+"

tokenizers..base ..= p ->
  var
    c = p.current-column
    rest = consume-chars (c, p.source-line)
    tokens = []

  if (c == 0)
    ; Line start: compute indentation
    var indent = 0
    while (rest.length > 0 && (rest[c] == ' ' || rest[c] == '\t'))
      var step-length = 0
      indent +=
        if (rest[c] == '\t') do
          if (p.tab-size > 0)
            p.tab-size
          else do
            p..current-column ..= c
            p = p.error "Tabs not allowed for indentation"
            1
        else 1
      c ++
    tokens.push (p.new-line-start-token indent)
    rest = consume-chars (indent, rest)

  var has-error = false
  while (rest.length > 0)
    ; Examine current char
    var
      cc = rest[0]
      text = ""
      token = null
    if (cc == " " || cc == "\t")
      ; Skip spaces
      text = cc
      var spaces = 1
      while (spaces < rest.length && (rest[spaces] == ' ' || rest[spaces] == '\t'))
        text += rest[spaces]
        spaces ++
    else if (("()[]{},".index-of cc) >= 0)
      ; Delimiter
      text = cc
      token = p.new-delimiter-token text
    else if (cc == ";")
      ; Comment
      text = rest
    ; Put string handling here
    else
      ; Tag
      if (token == null)
        text = try-match (rest, tag-pattern)
        if (text != "")
          token = p.new-token (Sym.tokens[":tag"], text)
      ; Number
      if (token == null)
        text = try-match (rest, number-base-pattern)
        if (text != "")
          var after-number = consume-chars (text.length, rest)
          var exp = try-match (after-number, number-exponent-pattern)
          if (exp != "")
            text += exp
          token = p.new-token (Sym.tokens[":val"], text, Number text)
      ; Operator
      if (token == null)
        text = try-match (rest, hash-operator-pattern)
        if (text == "")
          text = try-match (rest, operator-pattern)
        if (text != "")
          token = p.new-token (Sym.tokens[":op"], text)
      ; Error
      if (token == null && ! has-error)
        has-error = true
        p..current-column ..= c
        p = p.error ("Unrecognized character '" + cc + "'")
        text = cc

    ; Clear error condition
    if (token != null)
      has-error = false

    rest = consume-chars (text.length, rest)
    c += text.length
    if (token != null)
      tokens.push token

  ;p.with-mutations #->
  ;  #it..current-column ..! c
  ;  #it..root.concat <.. tokens
  p..current-column ..= c
  p..root.concat <=.. tokens
  p




module.exports = tokenizers
