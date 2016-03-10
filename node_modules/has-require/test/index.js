'use strict';

var expect     = require('chai').expect;
var hasRequire = require('../');

describe('has-require', function () {

  it('matches single quotes', function () {
    expect(hasRequire('require(\'foo\')', 'foo')).to.be.true;
  });

  it('matches double quotes', function () {
    expect(hasRequire('require("foo")', 'foo')).to.be.true;
  });

  it('matches with whitespace around id', function () {
    expect(hasRequire('require( "foo" )', 'foo')).to.be.true;
  });

  it('only matches the specified id', function () {
    expect(hasRequire('require("foo")', 'bar')).to.be.false;
  });

  it('requires an id', function () {
    expect(hasRequire).to.throw('id is required');
  });

  it('exposes a constructor for storing code', function () {
    var code = 'require("foo")';
    var checker = new hasRequire.Checker(code);
    expect(checker.code).to.equal(code);
    expect(checker.has('foo')).to.be.true;
  });

});
