#external module

var Immutable = require 'immutable'

var Ast = (
    sym
    val
    args
    src-file
    src-line-from
    src-line-to
    src-column-from
    src-column-to
    org-file
    org-line-from
    org-line-to
    org-column-from
    org-column-to
    mutable?
    ) ->
    this.sym = sym
    this.val = sym
    this.args = do
      var my-args = Immutable.List(args)
      if (mutable?)
        my-args = my-args.as-mutable()
      my-args
    this.src-file = src-file
    this.src-line-from = src-line-from
    this.src-line-to = src-line-to
    this.src-column-from = src-column-from
    this.src-column-to = src-column-to
    this.org-file = org-file
    this.org-line-from = org-line-from
    this.org-line-to = org-line-to
    this.org-column-from = org-column-from
    this.org-column-to = org-column-to
    this.mutable? = if mutable? true else false

Ast.prototype.clone = #-> new Ast
  this.sym
  this.val
  this.args
  this.src-file
  this.src-line-from
  this.src-line-to
  this.src-column-from
  this.src-column-to
  this.org-file
  this.org-line-from
  this.org-line-to
  this.org-column-from
  this.org-column-to
  this.mutable?

Ast.prototype.as-mutable = #->
  if (this.mutable?)
    ; Add some more info to the error
    throw new Error "Symbol is already mutable"
  else do
    var result = this.clone()
    result.args = result.args.as-mutable()
    result.mutable? = true
    result

Ast.prototype.as-immutable = #-> do
  this.args = this.args.as-immutable()
  this.mutable? = false
  this


Ast.prototype.set-property = (name, value) ->
  var result =
    if (this.mutable?)
      this
    else
      this.clone()
  result[name] = value
  result


#defmacro #define-ast-setter
  arity: unary
  precedence: LOW
  expand: (tag) -> do
    var s = tag.val
    var cs = s.charAt(0).toUpperCase() + s.slice(1)
    `(Ast.prototype. (~` tag.new-tag("set" + cs)) = #-> this.set-property(~` tag.new-value s, #it))

#define-ast-setter sym
#define-ast-setter val
#define-ast-setter args
#define-ast-setter srcFile
#define-ast-setter srcLineFrom
#define-ast-setter srcLineTo
#define-ast-setter srcColumnFrom
#define-ast-setter srcColumnTo
#define-ast-setter orgFile
#define-ast-setter orgLineFrom
#define-ast-setter orgLineTo
#define-ast-setter orgColumnFrom
#define-ast-setter orgColumnTo


Ast.prototype.at = (idx, value) ->
  if (value ?)
    this.set-args (this.args.set (idx, value))
  else
    this.args.get idx

Ast.prototype.get = #-> this[#it]
Ast.prototype.set = Ast.prototype.set-property

Ast.prototype.at0 = #-> this.at (0, #it)
Ast.prototype.at1 = #-> this.at (1, #it)
Ast.prototype.at2 = #-> this.at (2, #it)
Ast.prototype.at3 = #-> this.at (3, #it)
Ast.prototype.at4 = #-> this.at (4, #it)
Ast.prototype.at5 = #-> this.at (5, #it)
Ast.prototype.at6 = #-> this.at (6, #it)
Ast.prototype.at7 = #-> this.at (7, #it)
Ast.prototype.at8 = #-> this.at (8, #it)
Ast.prototype.at9 = #-> this.at (9, #it)

Ast.prototype.transformation = (ctx, pre-step, post-step) ->
  this.args

Ast.prototype.transform-args = (ctx, transformation) ->
  this


module.exports = Ast
