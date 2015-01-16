#external module
#metaimport '../lib/macros'

var Immutable = require 'immutable'



var tokenizers = Immutable.Map()

; Each tokenizer function expects the following args:
; - ctx: the current compiler context
; - tokens: an array of ast nodes where the generated tokens are appended
; - source: the string to tokenize (can be multiline)
; It returns the new ctx, updating current-line and current-line in the
; tokenizer state and eventually adding errors.

tokenizers..base ..= (ctx, tokens, source) ->
  ctx




module.exports = tokenizers
