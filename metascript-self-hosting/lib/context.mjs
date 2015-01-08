#external module

var Immutable = require 'immutable'

var Scope = Immutable.Record {
  symbols: new Immutable.Map()

}
Scope.empty = new Scope()


var Context = Immutable.Record {
  scopes: new Immutable.Stack([Scope.empty])
}

Context.ctx? = #-> #it.constructor == Context

Context.create = props -> new Context props

Context.Scope = Scope

module.exports = Context
