#external module
#metaimport './macros'

var Immutable = require 'immutable'

var Msg = Immutable.Record {
  message: "error"
  source: "[unknown]"
  line: 0
  column: 0
  line-to: 0
  column-to: 0
  details: Immutable.List()
}

var string-or-value = (v, other) ->
  if (typeof v == "string")
    v
  else
    other
var number-or-value = (v, other) ->
  if (typeof v == "number")
    v
  else
    other

Msg.create = (message, source, line, column, line-to, column-to) ->
  new Msg {
    message: string-or-value (message, "error")
    source: string-or-value (source, "[unknown]")
    line: number-or-value (line, 1)
    column: number-or-value (column, 1)
    line-to: number-or-value (line-to, number-or-value (line, 1))
    column-to: number-or-value (column-to, (if (typeof column == "number") (column + 1) else 1))
  }

Msg.from-location = (message, location) -> Msg.create
  message
  location.source
  location.line-from
  location.column-from
  location.line-to
  location.column-to

Msg.from-ast = (ast, message) -> do
  var result = Msg.from-location (message, ast.loc.actual)
  if (ast.loc.has-expansion-data) do
    var expansion = Msg.from-location ("Expanded from here", ast.loc.original)
    result..details ..= (result.details.push expansion)
  result

module.exports = Msg
