#external module
#metaimport '../lib/macros'

var Immutable = require 'immutable'
var Ast = require "./ast"

;new-token = (sym, val, src, line, column, length) ->


var try-match = (pattern, string) ->
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
; advanced or errors have been generated (or both).

tokenizers..base ..= p ->
  var
    c = p.current-column
    rest = p.source-line.substring




module.exports = tokenizers
