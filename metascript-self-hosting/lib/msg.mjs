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

Msg.create-at = (message, source, line, column, length) -> Msg.create
  message
  source
  line
  column
  line
  column + number-or-value (length, 1)

Msg.from-ast = (ast, message) -> do
  var result = Msg {
    message: message
    source: ast.src-file
    line: ast.src-line-from
    column: ast.src-column-from
    line-to: ast.src-line-to
    column-to: ast.src-column-to
  }
  if (ast.has-expansion-location()) do
    var expansion = Msg {
      message: "Expanded from here"
      source: ast.org-file
      line: ast.org-line-from
      column: ast.org-column-from
      line-to: ast.org-line-to
      column-to: ast.org-column-to
    }
    result..details ..= (result.details.push expansion)
  result

module.exports = Msg
