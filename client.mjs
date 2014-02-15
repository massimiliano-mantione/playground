#external
  Primus
  document
  alert
  arguments
  Array

meta
  macro '<-'
    precedence: LOW
    arity: binary
    expand:
      var tuple = expr.newTuple()
      var right = expr.argAt 1
      loop (right) do
        if (right == ())
          end
        else if (right.isCall())
          tuple.push(right.argAt 0)
          next(right.argAt 0)
        else
          tuple.push(right)
          end
      if (tuple.argCount == 1)
        tuple.transformInto(tuple.argAt 0)
      var result = expr.newCall()
      result.push(expr.argAt 0)
      result.push tuple
      result

var
  React = require 'react'
  reactComponentWrapper = (cmp)->
    ()->
      var newArguments = []
      if (arguments.length == 0 ||
          typeof arguments[0] != 'object' ||
          (arguments[0] != null && arguments[0].constructor != Object))
        newArguments.push {}
      loop (var i = 0)
        if (i < arguments.length)
          var arg = arguments[i]
          if (typeof arg == 'object' && arg.constructor == Array)
            loop (var j = 0)
              if (j < arg.length)
                newArguments.push(arg[j])
                next(j + 1)
          else
            newArguments.push arg
          next(i + 1)
      return cmp.apply(null, newArguments)
  div = reactComponentWrapper(React.DOM.div)
  p = reactComponentWrapper(React.DOM.p)
  input = reactComponentWrapper(React.DOM.input)
  h1 = reactComponentWrapper(React.DOM.h1)

var chatData = {
  input: 'Nickname'
  log: []
}

var primus = new Primus('http://localhost:8080', {})

var body = null

var Body = React.createClass {
  getInitialState: () -> chatData
  handleKeyUp: (e)->do
    console.log 'keyUp'
    chatData.input = e.target.value
    if (e.keyCode == 13)
      console.log 'Before'
      primus.write(chatData.input)
      chatData.input = ''
      console.log 'After'
    this.setState chatData

  handleNewMessage: (message) -> do
    chatData.log.push message
    this.setState chatData

  render: () ->
    body = this
    return div
      h1 'Chat example'
      input {
        value: this.state.input
        onChange: (e)->
          console.log 'onChange'
          chatData.input = e.target.value
          body.setState chatData
        onKeyUp: (e) ->
          body.handleKeyUp e
      }
      this.props.log.map
        (message) -> p message
}

primus.on
  'data'
  (data) -> body.handleNewMessage data

React.renderComponent
  Body chatData
  document.body
