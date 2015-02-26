#external
  process

var
  fs = require "fs"
  stats = require "stats-lite"
  inspect = (require "util").inspect
  args = require('argh').argv

var
  input-file-name = args.log
  latency-file-name = args.msg
  inflight-file-name = args.flight

if (input-file-name == undefined || latency-file-name == undefined || inflight-file-name == undefined)
  console.log "usage: node process-log.js --in=log.json --msg=msg.csv --flight=flight.csv"
  process.exit()


var file-data = fs.read-file-sync input-file-name
var data = JSON.parse file-data

var
  deltas = []
  events = []
  errors = []
  lost-count = 0

data.clients.for-each
  client ->
    client.messages.for-each #-> do!
      if (#it.received != 0)
        deltas.push (#it.received - #it.sent)
        events.push {
            time: #it.sent
            delta: -1
          }
        events.push {
            time: #it.received
            delta: #it.received - #it.sent
          }
      else
        lost-count ++
    client.errors.for-each #->
      errors.push #it

events.sort
  (a, b) -> a.time - b.time

var
  latency-file = fs.open-sync (latency-file-name, "w")
  inflight-file = fs.open-sync (inflight-file-name, "w")

var inflight-count = 0
events.for-each #-> do!
  var delta = #it.delta
  var time = #it.time - data.start-time
  if (delta < 0)
    inflight-count ++
  else
    inflight-count --
    fs.write-sync  (latency-file, time + "," + delta + "\n")
  fs.write-sync  (inflight-file, time + "," + inflight-count + "\n")

fs.close-sync latency-file
fs.close-sync inflight-file

var results = {
  latency: {
      mean: stats.mean(deltas)
      variance: stats.variance(deltas)
    }
  error-count: errors.length
  lost-count: lost-count
}

console.log (inspect results)
