#external (module, arguments, Symbol)

var Immutable = require 'immutable'
var Loc = require './loc'
var Sym = require './sym'

var AstData = Immutable.Record {
  doc: null
  type: null
}
AstData.empty = AstData()

var Ast = (
    sym
    val
    args
    data
    loc
    mutable?
  ) -> do!
    if (! (this instanceof Ast)) do
      return new Ast
        sym
        val
        args
        data
        loc
        mutable?
    this.sym =
      if (sym instanceof Sym) sym
      else Sym.error
    this.val = val
    this.args = do
      var my-args = Immutable.List(args)
      if (mutable?)
        my-args = my-args.as-mutable()
      my-args
    this.data =
      if (typeof data != "undefined") data
      else AstData.empty
    this.loc =
      if (typeof loc != "undefined") loc
      else Loc.unknown
    this.mutable? = ! ! mutable?

Ast.prototype.clone = #-> new Ast
  this.sym
  this.val
  this.args
  this.data
  this.loc
  this.mutable?

Object.defineProperty
  Ast.prototype
  "id"
  {
    get: #-> this.sym.id
    set: #-> throw new Error 'Ast.prototype.id is not writable'
    enumerable: true
    configurable: false
  }

Ast.prototype.array-dump = #->
  var result = [this.id]
  if (this.val != undefined)
    result.push this.val
  if (this.size > 0)
    result.push
      this.args.map(#-> #it.array-dump()).to-array()
  result

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

Ast.prototype.with-mutations = #-> do
  var (must-reconvert, mutated) =
    if (this.mutable?)
      (false, this)
    else
      (true, this.as-mutable())
  #it mutated
  if must-reconvert
    mutated.as-immutable()
  else
    mutated

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
#define-ast-setter data
#define-ast-setter loc


Ast.prototype.at = (idx, value) ->
  if (value ?)
    this.set-args (this.args.set (idx, value))
  else
    this.args.get idx
Ast.prototype.get = #->
  if (typeof #it == "number")
    this.args.get #it
  else
    this[#it]
Ast.prototype.set = (key, value) ->
  if (typeof key == "number")
    this.set-args (this.args.set (key, value))
  else
    this.set-property (key, value)

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
  this

Ast.prototype.transform-args = (ctx, pre-step, post-step) ->
  this


; Macros to wrap args List methods
#defmacro #wrap-ast-args-method-all
  arity: unary
  precedence: LOW
  expand: (tag) -> `
    Ast.prototype.(~` tag) = #-> this.set-args
      this.args.(~` tag).apply(this.args, arguments)
#defmacro #wrap-ast-args-method0a
  arity: unary
  precedence: LOW
  expand: (tag) -> do
    if (tag.value?())
      tag = tag.new-tag tag.get-simple-value()
    `(Ast.prototype.(~` tag) = #-> this.args.(~` tag)())
#defmacro #wrap-ast-args-method0r
  arity: unary
  precedence: LOW
  expand: (tag) -> do
    if (tag.value?())
      tag = tag.new-tag tag.get-simple-value()
    `(Ast.prototype.(~` tag) = #-> do (this.args.(~` tag)(), this))
#defmacro #wrap-ast-args-method0m
  arity: unary
  precedence: LOW
  expand: (tag) -> do
    if (tag.value?())
      tag = tag.new-tag tag.get-simple-value()
    `(Ast.prototype.(~` tag) = #-> this.set-args (this.args.(~` tag)()))
#defmacro #wrap-ast-args-method1a
  arity: unary
  precedence: LOW
  expand: (tag) -> do
    if (tag.value?())
      tag = tag.new-tag tag.get-simple-value()
    `(Ast.prototype.(~` tag) = #-> this.args.(~` tag)(#1))
#defmacro #wrap-ast-args-method1r
  arity: unary
  precedence: LOW
  expand: (tag) -> do
    if (tag.value?())
      tag = tag.new-tag tag.get-simple-value()
    `(Ast.prototype.(~` tag) = #-> do (this.args.(~` tag)(#1), this))
#defmacro #wrap-ast-args-method1m
  arity: unary
  precedence: LOW
  expand: (tag) -> do
    if (tag.value?())
      tag = tag.new-tag tag.get-simple-value()
    `(Ast.prototype.(~` tag) = #-> this.set-args (this.args.(~` tag)(#1)))
#defmacro #wrap-ast-args-method2a
  arity: unary
  precedence: LOW
  expand: (tag) -> do
    if (tag.value?())
      tag = tag.new-tag tag.get-simple-value()
    `(Ast.prototype.(~` tag) = #-> this.args.(~` tag)(#1, #2))
#defmacro #wrap-ast-args-method2r
  arity: unary
  precedence: LOW
  expand: (tag) -> do
    if (tag.value?())
      tag = tag.new-tag tag.get-simple-value()
    `(Ast.prototype.(~` tag) = #-> do (this.args.(~` tag)(#1, #2), this))
#defmacro #wrap-ast-args-method2m
  arity: unary
  precedence: LOW
  expand: (tag) -> do
    if (tag.value?())
      tag = tag.new-tag tag.get-simple-value()
    `(Ast.prototype.(~` tag) = #-> this.set-args (this.args.(~` tag)(#1, #2)))
#defmacro #wrap-ast-args-method3a
  arity: unary
  precedence: LOW
  expand: (tag) -> do
    if (tag.value?())
      tag = tag.new-tag tag.get-simple-value()
    `(Ast.prototype.(~` tag) = #-> this.args.(~` tag)(#1, #2, #3))
#defmacro #wrap-ast-args-method3r
  arity: unary
  precedence: LOW
  expand: (tag) -> do
    if (tag.value?())
      tag = tag.new-tag tag.get-simple-value()
    `(Ast.prototype.(~` tag) = #-> do (this.args.(~` tag)(#1, #2, #3), this))
#defmacro #wrap-ast-args-method3m
  arity: unary
  precedence: LOW
  expand: (tag) -> do
    if (tag.value?())
      tag = tag.new-tag tag.get-simple-value()
    `(Ast.prototype.(~` tag) = #-> this.set-args (this.args.(~` tag)(#1, #2, #3)))
#defmacro #wrap-ast-args-method4r
  arity: unary
  precedence: LOW
  expand: (tag) -> do
    if (tag.value?())
      tag = tag.new-tag tag.get-simple-value()
    `(Ast.prototype.(~` tag) = #-> do (this.args.(~` tag)(#1, #2, #3, #4), this))
#defmacro #wrap-ast-args-method4m
  arity: unary
  precedence: LOW
  expand: (tag) -> do
    if (tag.value?())
      tag = tag.new-tag tag.get-simple-value()
    `(Ast.prototype.(~` tag) = #-> this.set-args (this.args.(~` tag)(#1, #2, #3, #4)))

; Wrappers around the args List, so that Ast looks like a List
var FAUX_ITERATOR_SYMBOL = '@@iterator'
var REAL_ITERATOR_SYMBOL = (typeof Symbol == 'function' && Symbol.iterator)
var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;
var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@'
;var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@'
;var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@'
;var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@'
Ast.prototype[IS_ITERABLE_SENTINEL] = true
Ast.prototype[ITERATOR_SYMBOL] = #-> this.args[ITERATOR_SYMBOL]
Object.defineProperty
  Ast.prototype
  ITERATOR_SYMBOL
  {
    get: #-> do
      var ast = this
      #-> ast.args[ITERATOR_SYMBOL]
    set: #-> throw new Error 'Ast.prototype.ITERATOR_SYMBOL is not writable'
    enumerable: false
    configurable: false
  }
Object.defineProperty
  Ast.prototype
  "__iterator"
  {
    get: #-> do
      var ast = this
      #-> ast.args["__iterator"](#1, #2)
    set: #-> throw new Error 'Ast.prototype.__iterator is not writable'
    enumerable: false
    configurable: false
  }
Object.defineProperty
  Ast.prototype
  "__iterate"
  {
    get: #-> do
      var ast = this
      #-> ast.args["__iterate"](#1, #2)
    set: #-> throw new Error 'Ast.prototype.__iterate is not writable'
    enumerable: false
    configurable: false
  }
Object.defineProperty
  Ast.prototype
  "size"
  {
    get: #-> this.args.size
    set: #-> throw new Error 'Ast.prototype.size is not writable'
    enumerable: true
    configurable: false
  }
#wrap-ast-args-method1m 'delete'
#wrap-ast-args-method0m clear
#wrap-ast-args-method-all push
#wrap-ast-args-method0m pop
#wrap-ast-args-method-all unshift
#wrap-ast-args-method0m shift
#wrap-ast-args-method0a first
#wrap-ast-args-method0a last
#wrap-ast-args-method3m update
#wrap-ast-args-method-all merge
#wrap-ast-args-method-all mergeWith
#wrap-ast-args-method-all mergeDeep
#wrap-ast-args-method-all mergeDeepWith
#wrap-ast-args-method1m setSize
#wrap-ast-args-method0a toSeq
#wrap-ast-args-method0a toKeyedSeq
#wrap-ast-args-method0a toIndexedSeq
#wrap-ast-args-method0a toSetSeq
#wrap-ast-args-method0a fromEntrySeq
#wrap-ast-args-method1a has
#wrap-ast-args-method1a contains
#wrap-ast-args-method2a getIn
#wrap-ast-args-method2a hasIn
#wrap-ast-args-method2m setIn
#wrap-ast-args-method3m updateIn
#wrap-ast-args-method0a toMap
#wrap-ast-args-method0a toOrderedMap
#wrap-ast-args-method0a toSet
#wrap-ast-args-method0a toOrderedSet
#wrap-ast-args-method0a toList
#wrap-ast-args-method0a toStack
#wrap-ast-args-method0a keys
#wrap-ast-args-method0a values
#wrap-ast-args-method0a entries
#wrap-ast-args-method0a keySeq
#wrap-ast-args-method0a valueSeq
#wrap-ast-args-method0a entrySeq
#wrap-ast-args-method2m map
#wrap-ast-args-method2m filter
#wrap-ast-args-method2m filterNot
#wrap-ast-args-method0m reverse
#wrap-ast-args-method1m sort
#wrap-ast-args-method2m sortBy
#wrap-ast-args-method2a forEach
#wrap-ast-args-method2m slice
#wrap-ast-args-method0m rest
#wrap-ast-args-method0m butLast
#wrap-ast-args-method1m skip
#wrap-ast-args-method1m skipLast
#wrap-ast-args-method2m skipWhile
#wrap-ast-args-method2m skipUntil
#wrap-ast-args-method1m take
#wrap-ast-args-method1m takeLast
#wrap-ast-args-method2m takeWhile
#wrap-ast-args-method2m takeUntil
#wrap-ast-args-method-all concat
#wrap-ast-args-method1m flatten
#wrap-ast-args-method2m flatMap
#wrap-ast-args-method1m interpose
#wrap-ast-args-method-all interleave
#wrap-ast-args-method-all splice
#wrap-ast-args-method-all zip
#wrap-ast-args-method-all zipWith
#wrap-ast-args-method3a reduce
#wrap-ast-args-method3a reduceRight
#wrap-ast-args-method2a every
#wrap-ast-args-method2a some
; It seems that List does not have an "isEmpty" method
;#wrap-ast-args-method0a isEmpty
#wrap-ast-args-method0a count
#wrap-ast-args-method2a countBy
#wrap-ast-args-method3a find
#wrap-ast-args-method3a findLast
#wrap-ast-args-method1a max
#wrap-ast-args-method2a maxBy
#wrap-ast-args-method1a min
#wrap-ast-args-method2a minBy
#wrap-ast-args-method1a indexOf
#wrap-ast-args-method1a lastIndexOf
#wrap-ast-args-method2a findIndex
#wrap-ast-args-method2a findLastIndex
; It seems that List does not have an "isSubset" method
;#wrap-ast-args-method1a isSubset
; It seems that List does not have an "isSuperset" method
;#wrap-ast-args-method1a isSuperset



Ast.ast? = #-> #it instanceof Ast

module.exports = Ast
