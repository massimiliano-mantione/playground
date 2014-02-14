var
  jade = require 'jade'
  express = require 'express'
  Primus = require 'primus'
  app = express()
  http = require 'http'
  server = http.createServer app
  primus = new Primus server
  htmlText = jade.renderFile('index.jade', {})
  util = require 'util'

app.get
  '/index.html'
  (res, rsp) -> rsp.send htmlText
app.get
  '/client.js'
  (res, rsp) -> rsp.sendfile './bundle.js'
app.get
  '/p-client.js'
  (res, rsp) -> rsp.send(primus.library())

var connections = new Object null

var Connection = (spark) -> do
  this.nick = null
  this.spark = spark
  spark.on
    'data'
    (data) -> do
      var c = connections[this.id]
      console.log('Connection ' + this.id + ' with nick ' + c.nick + ' got ' + util.inspect(data))
      if (c.nick != null)
        primus.write(c.nick + ': ' + data)
      else
        c.nick = data
        primus.write('User ' + data + ' joined the chat')

primus.on
  'connection'
  (spark) -> do
    console.log('Connection ' + spark.id)
    connections[spark.id] = new Connection spark

primus.on
  'disconnection'
  (spark) -> do
    console.log('Disconnection ' + spark.id)
    delete connections[spark.id]


server.listen(8080);

