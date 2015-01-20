#external (describe, it)
#metaimport '../lib/macros'

var expect = (require "chai").expect

var Loc = require '../lib/loc'

describe
  "Loc"
  #->
    it
      "Can be converted to esprima format"
      #->
        var l = Loc {
            actual: Loc.Location {source: "src", line-from: 42, line-to: 42,
              column-from: 12, column-to: 13}
            original: Loc.Location {source: "org", line-from: 21, line-to: 21,
              column-from: 7, column-to: 9}
          }
        expect(l.has-expansion-data).to.equal true
        expect(l.to-esprima()).to.eql {
            source: "src"
            start: {line: 42, column: 12}
            end: {line: 42, column: 13}
          }
