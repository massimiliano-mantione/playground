#external module
#metaimport '../lib/macros'

var Immutable = require 'immutable'
var tokenizers = require './tokenizers'
var Sym = require './sym'
var Ast = require './ast'
var Msg = require './msg'
var Loc = require './loc'
var GrouperState = require './grouper'

var Parser = Immutable.Record {
  source: Immutable.List()
  source-name: "[unknown]"
  base-line : 1
  base-column : 1
  current-line : 0
  current-column : 0
  available-tokenizers: tokenizers
  tokenizers: Immutable.Stack([tokenizers..base])
  group-stack: Immutable.Stack()
  errors: Immutable.List()
  tab-size: -1
  root: Ast (Sym.tokens[":root"])
}

Parser.default-state = Parser()

Object.defineProperty
  Parser.prototype
  "hasErrors"
  {
    get: #-> this.errors.size > 0
    set: #-> throw new Error 'Ast.prototype.hasErrors is not writable'
    enumerable: true
    configurable: false
  }

Parser.prototype.error = (message, length) ->
  this..errors.push <.. Msg.create
    message
    this.source-name
    this.base-line + this.current-line
    this.base-column + this.current-column
    this.base-line + this.current-line
    this.base-column + this.current-column +
      if (typeof length != 'undefined') length else 1



Parser.prototype.reset-root = #->
  this..root ..! Parser.default-state.root

Parser.prototype.reset-errors = #->
  this..errors ..! Parser.default-state.errors


Object.defineProperty
  Parser.prototype
  "isSourceEmpty"
  {
    get: #-> this.source.size == 0
    set: #-> throw new Error 'Ast.prototype.sourceIsEmpty is not writable'
    enumerable: true
    configurable: false
  }

Object.defineProperty
  Parser.prototype
  "isSourceLoaded"
  {
    get: #-> this.source.size > 0
    set: #-> throw new Error 'Ast.prototype.sourceIsNotEmpty is not writable'
    enumerable: true
    configurable: false
  }

Object.defineProperty
  Parser.prototype
  "isDone"
  {
    get: #-> this.current-line >= this.source.size
    set: #-> throw new Error 'Ast.prototype.isDone is not writable'
    enumerable: true
    configurable: false
  }

Object.defineProperty
  Parser.prototype
  "sourceLine"
  {
    get: #->
      if (this.done?)
        null
      else
        this.source.get this.current-line
    set: #-> throw new Error 'Ast.prototype.sourceLine is not writable'
    enumerable: true
    configurable: false
  }

Object.defineProperty
  Parser.prototype
  "isLineDone"
  {
    get: #->
      if (this.done?)
        true
      else
        this.current-column >= this.source-line.length

    set: #-> throw new Error 'Ast.prototype.isLineDone is not writable'
    enumerable: true
    configurable: false
  }

Parser.prototype.next-line = #->
  this.with-mutations #->
    #it..current-column ..! 0
    #it..current-line ..!> (#-> #it + 1)


Parser.prototype.load-string = (source, source-name) ->
  this.with-mutations #->
    if (typeof source-name != "string")
      source-name = "[unknown]"
    #it..source ..! (Immutable.List (source.split "\n"))
    #it..current-line ..! 0
    #it..current-column ..! 0

Parser.prototype.load-file = (file-name) ->
  var fs = require "fs"
  try do
    var source = fs.readFileSync (file-name, {encoding: 'utf8'})
    this.load-string source
  catch (var e)
    this..errors.push <.. Msg.create
      e.message
      file-name
      this.base-line
      this.base-column
      this.base-line
      this.base-column + 1

Parser.prototype.current-location-at-column = (column, length) -> Loc.Location {
    source: this.source-name
    line-from: this.base-line + this.current-line
    line-to: this.base-line + this.current-line
    column-from: this.base-column + column
    column-to: this.base-column + column + length
  }

Parser.prototype.current-location = length ->
  this.current-location-at-column (this.current-column, length)

Parser.prototype.new-token = (sym, text, value, column) -> do
  if (typeof column == 'undefined')
    column = this.current-column
  var location = this.current-location-at-column (column, text.length)
  Ast
    sym
    if (typeof value != 'undefined') value else text
    undefined
    undefined
    Loc {
      actual: location
      original: location
    }

Parser.prototype.new-delimiter-token = (sym, column) -> do
  if (typeof column == 'undefined')
    column = this.current-column
  var location = this.current-location-at-column (column, 1)
  Ast
    sym
    undefined
    undefined
    undefined
    Loc {
      actual: location
      original: location
    }

Parser.prototype.new-line-start-token = (indentation, length) -> do
  var location = this.current-location-at-column (0, length)
  Ast
    Sym.tokens[":l"]
    indentation
    undefined
    undefined
    Loc {
      actual: location
      original: location
    }


Object.defineProperty
  Parser.prototype
  "tokenizer"
  {
    get: #-> this.tokenizers.get 0
    set: #-> throw new Error 'Ast.prototype.tokenizer is not writable'
    enumerable: true
    configurable: false
  }

Parser.prototype.push-tokenizer = #->
  this..tokenizers.push <.. #it

Parser.prototype.pop-tokenizer = #->
  if (this.tokenizers.size > 1)
    this..tokenizers.pop <.. ()
  else
    this.error "Cannot pop the last tokenizer"

Parser.prototype.tokenize-line = #->
  var p = this
  if (p.done?)
    return p.error "No more lines to parse"
  if (p.line-done? && p.source-line.lengh > 0)
    return p.error "Current line has already been parsed"
  ; We should check if making p mutable improves performance
  while (! p.line-done?)
    p = p.tokenizer p
  p.next-line()

Parser.prototype.tokenize-source = #->
  var p = this
  if (p.done?)
    return p.error
      if (p.source-empty?) "Source is empty"
      else "Source has already been tokenized"
  ; We should check if making p mutable improves performance
  while (! p.done?)
    p = p.tokenize-line()
  p

module.exports = Parser
