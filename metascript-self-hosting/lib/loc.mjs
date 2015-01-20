#external module

var Immutable = require 'immutable'

var Sym = require './sym'
var Msg = require './msg'


var Location = Immutable.Record {
  source: "[unknown]"
  line-from: 1
  line-to: 1
  column-from: 1
  column-to: 1
}

Location.unknown = Location()

Location.prototype.equals = other ->
  ( this == other ||
    ( this.source == other.source &&
      this.line-from == other.line-from &&
      this.line-to == other.line-to &&
      this.column-from == other.column-from &&
      this.column-to == other.column-to))

Location.prototype.to-esprima = #-> {
    source: this.source
    start: {line: this.line-from, column: this.column-from}
    end: {line: this.line-to, column: this.column-to}
  }

var Loc = Immutable.Record {
  actual: Location.unknown
  original: Location.unknown
}

Loc.Location = Location
Loc.unknown = Loc()

Object.defineProperty
  Loc.prototype
  "hasExpansionData"
  {
    get: #->
      ! (this.actual.equals this.original)
    set: #-> throw new Error 'Loc.prototype.hasExpansionData is not writable'
    enumerable: true
    configurable: false
  }

Loc.prototype.to-esprima = #->
  this.actual.to-esprima()

module.exports = Loc
