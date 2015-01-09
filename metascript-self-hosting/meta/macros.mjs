#metamodule
  #keepmacro ..
    arity: binary
    precedence: MEMBER
    expand: (value, member) -> do
      #external (process-member, process-member-expression)
      var data = {
        value: null
        members: []
      }
      process-member (member, data.members)
      process-member-expression (value, data)
      if (data.members.length == 1)
        ` (~` (data.value)).get(~` (data.members[0]))
      else
        ` (~` (data.value)).get-in([(~` (data.members))])

  #keepmacro ..!
    arity: binary
    precedence: ASSIGNMENT
    pre-expand: (value, mutator) ->
      #external (process-member-expression, expression-contains-it)
      var data = {
        value: null
        members: []
      }
      process-member-expression (value, data)
      if (data.members.length == 0)
        ; Cursor case
        ` (~` (data.value)).update(#-> ~`mutator)
      else if (data.members.length == 1)
        if (expression-contains-it mutator)
          ` (~` (data.value)).update(~` (data.members[0]), #-> ~`mutator)
        else
          ` (~` (data.value)).set(~` (data.members[0]), ~`mutator)
      else
        ` (~` (data.value)).update-in([(~` (data.members))], #-> ~`mutator)


  #keepmacro ..=
    arity: binary
    precedence: ASSIGNMENT
    pre-expand: (value, mutator) ->
      #external (process-member-expression)
      var data = {
        value: null
        members: []
      }
      process-member-expression (value, data)
      ` ((~` (data.value)) = ((~` value) ..! (~` mutator)))

; Theese macros expect two variables in scope, with exactly these names:
; - original-ctx (the ctx that was originally passed to the function)
; - ctx (the current ctx)
; Their argument is an expression that evaluates to one of the following:
; - an Ast (possibly null)
; - an [Ast] (plain array, if empty has the same meaning as null)
; - a Context
; - a Context.Wrapper
  #keepmacro #unwrap
    arity: unary
    precedence: LOW
    expand: result -> do
      var code = ` do
        var \r = ~` result
        if (Context.ctx? \r) do
          ctx = \r
          \r = null
        else if (Context.wrapper? \r) do
          ctx = \r.ctx
          \r = \r.ast
        \r
      code.resolve-virtual()
      code
  #keepmacro #wrap
    arity: unary
    precedence: LOW
    expand: result -> do
      var code = ` do
        var \r = #unwrap ~` result
        if (ctx == original-ctx)
          \r
        else
          ctx.wrap \r
      code.resolve-virtual()
      code


#keep-meta
  var process-member = (member, members) -> do!
    members.unshift
      if (member.tag?())
        member.new-value member.get-simple-value()
      else if (member.array?)
        if (member.count == 1)
          member.at 0
        else do
          member.error ('Expected 1 selector instead of ' + member.count)
          ''
      else do
        member.error 'Invalid member'
        ''

  var process-member-expression = (member-expression, data) -> do!
    if (member-expression.id == '..')
      var (v, m) = (member-expression.at 0, member-expression.at 1)
      process-member (m, data.members)
      process-member-expression (v, data)
    else
      data.value = member-expression

  var expression-contains-it = #->
    if (#it.placeholder?() && #it.get-simple-value() == '#it')
      true
    else do
      var i = 0
      while (i < #it.count)
        if (expression-contains-it (#it.at i))
          return true
        i++
      false