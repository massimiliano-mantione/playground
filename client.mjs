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
  setInput: (text) ->
    this.input = text
    this.refreshView()
  log: []
  logAppend: (message) ->
    this.log.push message
    this.refreshView()
  view: null
  refreshView: () -> do
    this.view.setState this
}

var primus = new Primus('http://localhost:8080', {})

var Body = React.createClass {
  getInitialState: () -> chatData

  render: () ->
    div
      h1 'Chat example'
      input {
        value: chatData.input
        onChange: (e)->
          chatData.setInput <- e.target.value
        onKeyUp: (e) -> do
          if (e.keyCode == 13)
            primus.write(chatData.input)
            chatData.setInput <- ''
      }
      chatData.log.map
        (message) -> p message
}
chatData.view = Body chatData

primus.on
  'data'
  (data) -> chatData.logAppend data

React.renderComponent
  chatData.view
  document.body
