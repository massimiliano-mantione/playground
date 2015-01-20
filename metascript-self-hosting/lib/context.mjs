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

  current-line : 1
  current-colums : 1
}

Context.prototype.wrap = #-> new Wrapper (this, #it)

Context.ctx? = #-> #it instanceof Context
Context.wrapper? = #-> #it instanceof Wrapper

Context.create = props -> new Context props

Context.Scope = Scope
Context.Wrapper = Wrapper


Context.prototype.ctx? = Context.ctx?
Context.prototype.wrapper? = Context.wrapper?
Context.prototype.create = Context.create
Context.prototype.Scope = Scope
Context.prototype.Wrapper = Wrapper


module.exports = Context
