#external module
#metaimport '../lib/macros'

var Immutable = require 'immutable'
var tokenizers = require './tokenizers'


var TokenizerState = Immutable.Record {

}


var Parser = Immutable.Record {
  source: Immutable.List()
  source-name: "[unknown]"
  base-line : 1
  base-colum : 1
  current-line : 0
  current-colum : 0
  tokenizers: tokenizers
  stack: Immutable.Stack([tokenizers..base])
  tab-size: -1
}

Parser.prototype.source-is-empty = #->
  this.source.size == 0

Parser.prototype.source-has-lines = #->
  this.source.size > 0

Parser.prototype.load-string = (source, source-name) ->
  this.with-mutations #->
    #it..source ..! null


;Parser.prototype.load-file = (ctx, file-name) ->



module.exports = Parser
