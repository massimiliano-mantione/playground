#external (describe, it, before-each)
#metaimport "../lib/macros"

var expect = (require "chai").expect
var Immutable = require 'immutable'

describe
  'Macros for Immutable'
  #-> do!
    var (l, l1, l2)

    before-each #->
      l = Immutable.List([1, 2, 3])
      l1 = l
      l2 = l

    it
      'Does not mutate a list if it does not need it'
      #->
        l1..[0] ..= 1
        expect(l1 == l).to.equal true
        l1..[1] ..= 2
        l1..[2] ..= 3
        expect(l1 == l).to.equal true
        expect(l1.equals l).to.equal true
        l2..[2] ..= 4
        expect(l2 == l).to.equal false
        expect(l2.equals l).to.equal false
        l2..[2] ..= 3
        expect(l2 == l).to.equal false
        expect(l2.equals l).to.equal true
