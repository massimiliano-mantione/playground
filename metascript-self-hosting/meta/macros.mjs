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
      #external (process-member-expression)
      var data = {
        value: null
        members: []
      }
      process-member-expression (value, data)
      if (data.members.length == 0) do
        data.value.error "Expression requires members"
        data.value
      else if (data.members.length == 1)
        ` (~` (data.value)).set(~` (data.members[0]), ~`mutator)
      else
        ` (~` (data.value)).set-in([(~` (data.members))], ~`mutator)

  #keepmacro ..!>
    arity: binary
    precedence: ASSIGNMENT
    pre-expand: (value, mutator) ->
      #external (process-member-expression)
      var data = {
        value: null
        members: []
      }
      process-member-expression (value, data)
      if (data.members.length == 0) do
        data.value.error "Expression requires members"
        data.value
      else if (data.members.length == 1)
        ` (~` (data.value)).update(~` (data.members[0]), ~`mutator)
      else
        ` (~` (data.value)).update-in([(~` (data.members))], ~`mutator)

  #keepmacro <..
    arity: binary
    precedence: ASSIGNMENT
    pre-expand: (method, mutator) ->
      #external (process-member-expression)
      if (! (method.member?() || method.element?())) do
        method.error "Member expression required"
        return method
      var value = method.at 0
      ` ((~`value) ..! ( (~`method) (~`mutator) ))


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

  #keepmacro ..=>
    arity: binary
    precedence: ASSIGNMENT
    pre-expand: (value, mutator) ->
      #external (process-member-expression)
      var data = {
        value: null
        members: []
      }
      process-member-expression (value, data)
      ` ((~` (data.value)) = ((~` value) ..!> (~` mutator)))

  #keepmacro <=..
    arity: binary
    precedence: ASSIGNMENT
    pre-expand: (method, mutator) ->
      #external (process-member-expression)
      if (! (method.member?() || method.element?())) do
        method.error "Member expression required"
        return method
      var value = method.at 0
      var data = {
        value: null
        members: []
      }
      process-member-expression (value, data)
      ` ((~` (data.value)) = ((~` method) <.. (~` mutator)))

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
  var first-to-upper = (s, prepend-underscore) -> do
    var lowercase = "abcdefghijklmnopqrstuvwxtz"
    if (s.length > 0) do
      var first = s.substring(0, 1)
      if ((lowercase.index-of first) >= 0)
        return first.to-upper-case() + s.substring(1)
    if (prepend-underscore)
      '_' + s
    else
      s

  var normalize-tag = tag ->
    var i
    while (tag[tag.length - 1] == '!' || tag[tag.length - 1] == '?')
      var prefix = if (tag[tag.length - 1] == '!') 'do' else 'is'
      var body = tag.substring(0, tag.length - 1)
      body = first-to-upper(body, false)
      tag = prefix + body;
    while ((i = tag.index-of('->')) >= 0)
      var before = tag.substring(0, i)
      var after = tag.substring(i + 2)
      var middle = if (before.length > 0) 'To' else 'to'
      tag = before + middle + first-to-upper(after, true)
    while ((i = tag.index-of('-')) >= 0)
      var before = tag.substring(0, i)
      var after = tag.substring(i + 1)
      tag = before + first-to-upper(after, true)
    tag

  var process-member = (member, members) -> do!
    members.unshift
      if (member.tag?())
        member.new-value (normalize-tag member.get-simple-value())
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
