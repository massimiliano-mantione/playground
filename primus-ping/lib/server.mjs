#external
  __dirname
  process

var
  Primus = require('primus')
  http = require('http')
  fs = require('fs')
  args = require('argh').argv

var
  port = 8844 ;443
  connection-counter = 0
  connections = {}

var get-connection-id = #->
  connection-counter ++
  "connection-" + connection-counter

var server = http.createServer
  (request, response) ->
    ; console.log((new Date()) + ' Received request for ' + request.url);
    response.setHeader('Content-Type', 'text/javascript')
    var
      filename =
        if (request.url.indexOf('primus.js' >= 0)) 'primus.js'
        else 'dummy.html'
      stream = fs.createReadStream(__dirname + "/" + filename)
    stream.pipe response

server.listen
  port
  #-> console.log((new Date()) + ' Server is listening on port ' + port)

if (! args.transformer ?)
  console.log "Error."
  console.log ""
  console.log "Usage:"
  console.log "\tserver --transformer engine.it"
  process.exit()


var primus = new Primus
  server
  {
    transformer: args.transformer
    parser: args.parser
    pathname: args.pathname || "/hyperfair_websocket"
  }

var handle-connection = spark ->
  var connection-id = get-connection-id()
  spark.connection-id = connection-id
  connections[connection-id] = spark

  spark.on
    "data"
    #-> spark.write #it

  spark.on
    'end'
    (reasonCode, description) ->
      console.log ("Connection " + spark.connection-id + " ended (code " + reasonCode + ", " + description + ")")
      delete connections[spark.connection-id]

primus.save 'primus.js'

primus.on
  "connection"
  handle-connection

server.listen (args.port || port)
