#external module
#metaimport '../lib/macros'

var Immutable = require 'immutable'
var Sym = require "./sym"


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
    tokens.push (p.new-line-start-token (indent, c))
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
      token = p.new-delimiter-token (text, c)
    else if (cc == ";")
      ; Comment
      text = rest
    else if (cc == '"' || cc == "'")
      var
        delimiter = cc
        index = 1
      while (index < rest.length && (rest.char-at index) == cc)
        delimiter += cc
        index ++
      if (delimiter.length == 2)
        ; Empty string can be handled directly
        text = delimiter
        token = p.new-token (Sym.tokens[":val"], text, "", c)
      else
        ; We must exit this loop setting up the parser to handle the string
        token = p.new-token (Sym.tokens[":sls"], delimiter, delimiter, c)
        return
          p.with-mutations #->
            #it..current-column ..! c + delimiter.length
            #it..root.concat <.. tokens
            #it..root.push <.. token
            #it.push-tokenizer (tokenizers..string-literal-handler delimiter)
    else
      ; Tag
      if (token == null)
        text = try-match (rest, tag-pattern)
        if (text != "")
          token = p.new-token (Sym.tokens[":tag"], text, text, c)
      ; Number
      if (token == null)
        text = try-match (rest, number-base-pattern)
        if (text != "")
          var after-number = consume-chars (text.length, rest)
          var exp = try-match (after-number, number-exponent-pattern)
          if (exp != "")
            text += exp
          token = p.new-token (Sym.tokens[":val"], text, Number text, c)
      ; Operator
      if (token == null)
        text = try-match (rest, hash-operator-pattern)
        if (text == "")
          text = try-match (rest, operator-pattern)
        if (text != "")
          token = p.new-token (Sym.tokens[":op"], text, text, c)
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

  p.with-mutations #->
    #it..current-column ..! c
    #it..root.concat <.. tokens


tokenizers..string-literal-handler ..= delimiter ->
  p ->
    var
      src = p.source-line
      start = p.current-column
      c = start
      single-quote? = delimiter.char-at 0 == "'"
      single-line? = delimiter.length == 1
      value = ""
      token = null
      var leading-spaces-stripped = false

    ; If necessary, handle leading spaces
    if (c == 0 && ! single-quote?)
      while (c < src.length && (src.char-at c == " " || src.char-at c == "\t"))
        c++
      if (c > 0)
        leading-spaces-stripped = true
        value = " "

    while (c < src.length)
      ; Test if we found the delimiter
      if (src.substr (c, delimiter.length) == delimiter)
        token =
          if (leading-spaces-stripped && value == " ") null
          else p.new-token
            Sym.tokens[":str"]
            src.substring(start, c) + delimiter
            value
        return
          p.with-mutations #->
            #it..current-column ..! c + delimiter.length
            if (token != null)
              #it..root.push <.. token
            #it.pop-tokenizer()

      ; Handle current character
      var cc = src.char-at c
      ; TODO: escape codes
      value += cc
      c++

    ; We reacher EOL without finding the delimiter
    if (single-quote?)
      value += "\n"
    token = p.new-token
      Sym.tokens[":str"]
      src.substring(start, c)
      value
    p.with-mutations #->
      #it..current-column ..! c
      #it..root.push <.. token


module.exports = tokenizers
