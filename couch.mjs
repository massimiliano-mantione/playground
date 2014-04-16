#external process
require('source-map-support').install()

var couchbase = require('couchbase').Mock
var couchbase-db = new couchbase.Connection()
var Rx = require('rx')
var Observable = Rx.Observable
var rx = Observable.fromNodeCallback

var Rx-db = (db) -> do!
  this.db = db
  this.get-on-db = db.get.bind db
  this.set-on-db = db.set.bind db
  this.set-design-doc = db.set-design-doc.bind db
  this.bound-queries = {}

Rx-db.prototype.get = (key) -> rx(this.get-on-db)(key)

Rx-db.prototype.set = (key, value) -> rx(this.set-on-db)(key, value)

Rx-db.prototype.get-value = (key) -> rx(this.get-on-db)(key).select(result -> result.value)

Rx-db.prototype.query = (view-name, query) ->
  var view = this.db.view(view-name, query)
  rx(view.query.bind(view))()


if true do!
  var db = new Rx-db couchbase-db
  db .->
    set('o1', {name: 'o1'})
    flatMap #-> db.get-value 'o1'
    action! #-> console.log #1
    catchException #-> console.log ('Exception: ' + #1)
    subscribe(#->)
else do!
  var db = couchbase-db
  db.set
    'o1'
    {name: 'o1'}
    #->
      db.get
        'o1'
        #->
          console.log
            if #1 ('ERROR: ' + #1)
            else #2

console.log 'OK'
process.stdin.on('data', () -> process.exit(0))



Rx-db.prototype.setup-view = (name, design-doc) ->
  var transform-functions =
    obj ->
      var result = obj
      if (typeof obj == 'object')
        if (Object.prototype.toString(obj) == '[object Array]')
          result = obj.map
            element -> (transform-functions element)
        else if (Object.prototype.toString(obj) != '[object Date]')
          result = {}
          obj.keys().forEach (k ->
              (result[k] = transform-functions(obj[k])))
      result
  rx(this.set-design-doc)(name, design-doc)
