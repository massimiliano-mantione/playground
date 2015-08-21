#external module
#metaimport '../lib/macros'

var Immutable = require 'immutable'
var Ast = require './ast'
var Sym = require './sym'
var Loc = require './loc'
var Msg = require './msg'

var GroupState = (
    parent
    sym
    start-token
    methods
  ) -> do!
    if (! (this instanceof GroupState))
      return new GroupState (parent, sym, start-token, methods)
    this.parent = parent
    this.sym = sym
    this.indentation =
      if (start-token.sym == Sym.tokens[':l']) start-token.val
      else if (this.parent != null) this.parent.indentation
      else 0 ; start-token.loc.actual.column-from
    this.start-token = start-token
    this.last-token = start-token
    this.string-value = null
    this.string-start = null
    this.string-end = null
    this.children = []
    this.handle-close = methods.handle-close
    this.handle-comma = methods.handle-comma
    this.handle-new-line = methods.handle-new-line
    this.errors =
      if (parent == null) []
      else parent.errors

var matching-close = {
  '(' : ')'
  '{' : '}'
  '[' : ']'
}

var parens-handle-close = #->
  if (matching-close[this.start-token.id] == #it.id)
    this.close()
  else
    this.error
      "Mismatched close symbol"
      #it

var block-handle-close = #->
  var parent =
    if (this.children.length > 0) this.close()
    else this.parent
  if (parent != this)
    parent = parent.handle-token #it
  parent

var block-handle-clomma = #->
  this.error ("Misplaced comma", #it)


GroupState.prototype.handle-token = #->
  console.log (" handle-token in '" + this.sym.id + "': '" + #it.array-dump() + "'")

  if (this.string-value != null)
    ; Build string value
    if (#it.sym == Sym.tokens[':str'])
      if (this.string-start == null)
        this.string-start = #it
      this.current-string-value += #it.val
      this.string-end = #it
    else
      if (this.string-start == null)
        this.string-start = #it
      if (this.string-end == null)
        this.string-end = #it
      this.children.push Ast
        Sym.tokens[':val']
        this.string-value
        undefined
        undefined
        Loc {
            actual: Loc.Location
              this.string-start.source
              this.string-start.line-from
              this.string-end.line-to
              this.string-start.column-from
              this.string-end.column-to
          }
      this.string-value = null
      this.string-start = null
      this.string-end = null
    return this

  if (#it.sym == Sym.tokens[':sls']) do
    ; Start building string value
    this.string-value = ''
    this
  else if (#it.sym == Sym.tokens['('])
    this.handle-open #it
  else if (#it.sym == Sym.tokens[')'])
    this.handle-close #it
  else if (#it.sym == Sym.tokens['['])
    this.handle-open #it
  else if (#it.sym == Sym.tokens[']'])
    this.handle-close #it
  else if (#it.sym == Sym.tokens['{'])
    this.handle-open #it
  else if (#it.sym == Sym.tokens['}'])
    this.handle-close #it
  else if (#it.sym == Sym.tokens[','])
    this.handle-comma #it
  else if (#it.sym == Sym.tokens[':l'])
    this.handle-new-line #it
  else if (#it.sym == Sym.tokens[':doc'])
    ; Ignore docs for now
    this
  else
    if (this.parens?())
      this.error
        "Misplaced token (out of parenthesis indentation block)"
        #it
    else do
      this.children.push #it
      this.last-token = #it
      this

var matching-open-symbol = {
  '(' : Sym.tokens['()'] ;)
  '{' : Sym.tokens['{}'] ;}
  '[' : Sym.tokens['[]'] ;]
}

var comma-handle-comma = #->
  var parent = this.close()
  parent.open
    Sym.tokens[',']
    #it
    {
      handle-close: #->
        this.close().handle-token #it
      handle-comma: comma-handle-comma
      handle-new-line: #-> this
    }

GroupState.prototype.handle-open = (token) -> do
  var group = this.open
    matching-open-symbol[token.id]
    token
    {
      handle-close: parens-handle-close
      handle-comma: #->
        ; This should never happen because comma blocks must handle it
        this.error
          "Compiler error: comma inside parenthesis block"
          #it
      handle-new-line: #->
        ; Ignore new line: only a closed parens will be accepted
        this
    }
  group.open
    Sym.tokens[',']
    token
    {
      handle-close: #->
        this.close().handle-token #it
      handle-comma: comma-handle-comma
      handle-new-line: #-> do
        console.log ("NEW LINE in COMMA: parent " + this.parent.children.length + ", mine " + this.children.length)
        if (#it.val <= this.indentation)
          this.error
            "Cannot deindent inside parenthesis"
            #it
        else if (this.parent.children.length == 0 && this.children.length  == 0)
          ; New line was immediately after the opening: switch to vertical mode
          this.parent.open-vertical-block #it
        else
          ; Stay in comma block despite the line change
          this
    }

GroupState.prototype.build-node = end-token ->
  if (end-token == undefined)
    end-token = this.last-token
  Ast
    this.sym
    undefined
    this.children
    undefined
    Loc {
        actual: Loc.Location
          this.start-token.source
          this.start-token.line-from
          end-token.line-to
          this.start-token.column-from
          end-token.column-to
      }

GroupState.prototype.close = end-token ->
  if (end-token == undefined)
    end-token = this.last-token
  if (this.parent == null)
    this.grouper-state.error
      "Attempting to close root block"
      end-token
  else do
    console.log (" --- CLOSE " + this.sym.id + " INTO " + this.parent.sym.id)
    this.parent.children.push (this.build-node end-token)
    this.parent

GroupState.prototype.open = (sym, start-token, methods) -> do
  console.log (" --- OPEN " + sym.id + " INSIDE " + this.sym.id)
  new GroupState (this, sym, start-token, methods)


GroupState.prototype.open-line-block = #->
  this.open
    Sym.tokens['lblk']
    #it
    {
      handle-close: block-handle-close
      handle-comma: block-handle-clomma
      handle-new-line: #->
        console.log (" ... LINE new line: here " + this.indentation + ", there " + #it.val)
        if (#it.val <= this.indentation)
          this.close(#it).handle-token #it
        else this.open-vertical-block #it
    }

GroupState.prototype.open-vertical-block = #->
  var block = this.open
    Sym.tokens['vblk']
    #it
    {
      handle-close: block-handle-close
      handle-comma: block-handle-clomma
      handle-new-line: #->
        if (#it.val < this.indentation)
          this.close(#it).handle-token #it
        else if (#it.val == this.indentation)
          this.open-line-block #it
        else
          ; This should never happen because line blocks must handle it
          this.error
            "Compiler error indenting inside vertical block"
            #it
    }
  block.open-line-block #it

GroupState.prototype.error = (message, token) -> do
  console.log(" *** ERROR at '" + token.id + "': " + message)
  this.errors.push Msg.create
    message
    token.loc.source
    token.loc.line-from
    token.loc.column-from
    token.loc.line-to
    token.loc.column-to
  this

var parens-symbol-ids = {
  '()' : true
  '[]' : true
  '{}' : true
}

GroupState.prototype.parens? = #->
  parens-symbol-ids[this.sym.id] == true

var grouper = root-token ->
  var state = GroupState
    null
    root-token.sym
    root-token
    {
      handle-close: block-handle-close
      handle-comma: block-handle-clomma
      handle-new-line: #->
        if (#it.val < this.indentation)
          this.handle-close #it
        else if (#it.val == this.indentation)
          if (this.children.length > 0)
            this.open-line-block #it
          else
            this.open-vertical-block #it
        else
          if (this.children.length == 0)
            this.open-vertical-block #it
          else do
            ; This should never happen because line blocks must handle it
            this.grouper-state.error
              "Compiler error indenting inside root block"
              #it
            this
    }
  console.log "PROCESSING..."
  root-token.for-each #->
    state = state.handle-token #it
  console.log "PROCESSED."
  while (state.parent != null) do
    if (state.parens?())
      state.error
        "Missing close symbol"
        state.start-token
    state = state.close()
  console.log "CLOSED."
  {
    ast: state.build-node()
    errors: state.errors
  }

module.exports = grouper
