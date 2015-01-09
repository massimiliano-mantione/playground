#external module

var Immutable = require 'immutable'

var Scope = Immutable.Record {
  symbols: new Immutable.Map()

}
Scope.empty = new Scope()

var Wrapper = (ctx, ast) -> do!
  this.ctx = ctx
  this.ast = ast

var Context = Immutable.Record {
  scopes: new Immutable.Stack([Scope.empty])
}

Context.prototype.wrap = #-> new Wrapper (this, #it)

Context.ctx? = #-> #it && #it.constructor == Context
Context.wrapper? = #-> #it && #it.constructor == Wrapper

Context.create = props -> new Context props

Context.Scope = Scope
Context.Wrapper = Wrapper

module.exports = Context
