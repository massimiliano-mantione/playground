#external
  process

var
  fs = require "fs"
  stats = require "stats-lite"
  inspect = (require "util").inspect

var filename = process.argv[2]


if (! filename ?)
  console.log "Input file required"
  process.exit()

var file-data = fs.read-file-sync filename
var data = JSON.parse file-data

var
  deltas = []
  errors = []
  lost-count = 0

data.for-each
  client ->
    client.messages.for-each #->
      if (#it.received != 0)
        deltas.push (#it.received - #it.sent)
      else
        lost-count ++
    client.errors.for-each #->
      errors.push #it

var results = {
  latency: {
      mean: stats.mean(deltas)
      variance: stats.variance(deltas)
    }
  error-count: errors.length
  lost-count: lost-count
}

console.log (inspect results)
