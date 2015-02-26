#external
  process
  set-timeout
  set-interval
  clear-interval

var
  primus = require 'primus'
  args = require('argh').argv
  transformer = args.transformer
  max-clients = args.clients
  baseURI = args.websocket
  rampspeed = args.rampspeed ; Milliseconds between client generation
  period = args.period ; Milliseconds between ping messages
  duration = args.duration ; Test duration in seconds
  finalwait = args.finalwait ; Wait time to receive messages after stopping clients in seconds

if (max-clients == undefined || transformer == undefined || baseURI == undefined || rampspeed == undefined || period == undefined || duration == undefined || finalwait == undefined)
  console.log "Error."
  console.log ""
  console.log "Usage:"
  console.log "\tclient --websocket ws://127.0.0.1:8844 --clients 10 --transformer sockjs --rampspeed 5 --period 1000 --duration 10 --finalwait 5"
  process.exit()

var
  test-start-time = Date.now()
  Socket = primus.createSocket
    {
      transformer: transformer
      pathname: '/hyperfair_websocket'
    }
  clients = []
  clients-count = 0
  get-client-index = #->
    var result = clients-count
    if (result >= max-clients)
      undefined
    else do
      clients-count ++
      result
  client-generator-timer = null
  send-timer = null

var send-message = client ->
  var
    message-id = client.next-message-id
    message = {
      client-index: client.index
      message-id: message-id
      sent: Date.now()
      received: 0
      filler: "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890"
    }
  client.messages[message-id] = message
  client.next-message-id ++
  client.write (JSON.stringify message)

var receive-message = (client, data) ->
  var message = JSON.parse data
  client.messages[message.message-id].received = Date.now()

var client-generator = #->
  var index = get-client-index()
  if (! index ?)
    console.log ("Generated clients: " + clients-count)
    clear-interval client-generator-timer
    return

  console.log ("Generating client " + index)
  var client = clients[index] = new Socket baseURI
  client.index = index
  client.open? = true
  client.messages = []
  client.errors = []
  client.next-message-id = 0

  client.on
    "data"
    #->
      receive-message (client, #it)
  client.on
    "error"
    #->
      client.errors.push (require("util").inspect #it)
  client.on
    "close"
    #->
      client.open? = false


client-generator-timer = set-interval
  #-> client-generator()
  rampspeed

send-timer = set-interval
  #->
    var start-time = Date.now()
    console.log ("Sending " + clients.length + " messages")
    clients.for-each #->
      send-message #it
    var end-time = Date.now()
    console.log ("  Send time: " + (end-time - start-time))
  period

set-timeout
  #->
    console.log "Stopping clients."
    clear-interval send-timer
    set-timeout
      #->
        console.log "Generating log..."
        var log = {
          start-time: test-start-time
          clients: []
        }
        clients.for-each #->
          var data = {
            client: #it.index
            messages: #it.messages
            errors: #it.errors
          }
          data.messages.for-each #->
            delete #it.filler
          log.clients.push data
        console.log "Writing log..."
        console.error (JSON.stringify log)
        console.log "Done."
        process.exit(0)
      finalwait * 1000
  duration * 1000

