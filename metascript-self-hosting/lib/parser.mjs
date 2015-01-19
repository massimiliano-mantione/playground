#external module
#metaimport '../lib/macros'

var Immutable = require 'immutable'
var tokenizers = require './tokenizers'
var symbol = require './symbol'
var Ast = require './ast'
var Msg = require './msg'


var GrouperState = Immutable.Record {

}

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
  root: Ast (symbol.tokens.root, undefined, [],
      "[unknown]", 1, 1, 1, 1,
      "[unknown]", 1, 1, 1, 1)
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
  this..errors.push <.. Msg.create-at
    message
    this.source-name
    this.base-line + this.current-line
    this.base-column + this.current-column
    length


Parser.prototype.reset-root = #->
  this..root ..! Parser.default-state.root

Object.defineProperty
  Parser.prototype
  "sourceIsEmpty"
  {
    get: #-> this.source.size == 0
    set: #-> throw new Error 'Ast.prototype.sourceIsEmpty is not writable'
    enumerable: true
    configurable: false
  }

Object.defineProperty
  Parser.prototype
  "sourceIsNotEmpty"
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
    #it..source ..! (Immutable.List (source.split '\n'))
    #it..current-line ..! 0
    #it..current-column ..! 0

Parser.prototype.load-file = (file-name) ->
  var fs = require "fs"
  try do
    var source = fs.readFileSync (file-name, {encoding: 'utf8'})
    this.load-string source
  catch (var e)
    this..errors.push <.. Msg.create-at
      e.message
      file-name
      this.base-line
      this.base-column




module.exports = Parser
