/*global describe:false, expect:false, it:false, delve:true */

describe('delve.js', function() {
  describe('delve', function() {
    it('should return a function', function() {
      expect(delve({ foo: 1, bar: '2' })).to.be.a('function');
    });
  });
  describe('inspect', function() {
    it('should return its source, when passed no arguments.', function() {
      expect(delve({ foo: 1, bar: '2' })()).to.eql({  foo: 1, bar: '2' });
    });
    it('should return a function in any other case.', function() {
      expect(delve({ foo: 1, bar: '2' })('foo')).to.be.a('function');
      expect(delve({ foo: 1, bar: '2' })({ bar: 'baz' })).to.be.a('function');
      expect(delve({ foo: 1, bar: '2' })(['foo', 'quux'])).to.be.a('function');
      expect(delve({ foo: 1, bar: '2' })(function(src){ return 'foo'; })).to.be.a('function');
    });
    it('should, when given a string, return an inspector function whose source is the value of the key named by the string.', function() {
      expect(delve({ foo: 1, bar: '2' })('foo')()).to.equal(1);
    });
    it('should, when given a number, and the source is an array, return an inspector function whose source is the item indexed by that number in the array.', function() {
      expect(delve(['zero', 'one', 'two'])(2)()).to.equal('two');
    });
    it('should, when given a number, the source is not an array, and the number is not zero, return a function which returns undefined.', function() {
      expect(delve('zero')(2)()).to.be.an('undefined');
    });
    it('should, when given a string that resolves to a number, and there is no string key of that value, act as if it were a number.', function() {
      expect(delve(['a', 'b', 'c'])('1')()).to.equal('b');
    });
    // This addresses a specific corner case, where an XML-JSON serializer represents a single child element as a non-array, but represents multiple child elements as an array.
    it('should, when given the number zero, and the source is not an array, return the source.', function() {
      expect(delve('zero')(0)()).to.equal('zero');
    });
    it('should, when given an object, and the source is an array of objects, return an inspector function whose source is the first item in the array with a property that matches the key(s) and value(s) of the object given.', function() {
      expect(delve([{ color: 'red', shape: 'square'}, { color: 'blue', shape: 'triangle' }, { color: 'green', shape: 'circle' }])({ color: 'blue' })()).to.eql({ color: 'blue', shape: 'triangle' });
    });
    it('should, when given an array, attempt to resolve each item in the array, in order, returning an inspector function whose source is the first successful match from the array of items.', function() {
      expect(delve({ foo: 1, bar: '2' })(['foo', 'what'])()).to.equal(1);
      expect(delve({ foo: 1, bar: '2' })(['no', 'foo'])()).to.equal(1);
    });
    it('should, when given a function, use the return value of that function (run with the source as the only parameter) as the item to match, and return an inspector function accordingly.', function() {
      expect(delve({ foo: 1, bar: '2' })(function(src) { return 'foo'; })()).to.equal(1);
    });
    it('should, when conditions are not met, return a function which returns undefined.', function() {
      expect(delve({ foo: 1, bar: '2' })('nope')()).to.be.an('undefined');
    });
    it('should return undefined at the end of a long chain where there is an undefined result early.', function() {
      expect(delve({ foo: [{ color: 'red', shape: 'square', features: { a: true, b: true, c: false } }, { color: 'blue', shape: 'triangle', features: { a: true, b: false, c: false } }, { color: 'green', shape: 'circle' }] })('foo')(3)('features')('a')()).to.be.an('undefined');
    });
    it('should follow a long chain to the end, returning the result.', function() {
      expect(delve({ foo: [{ color: 'red', shape: 'square', features: { a: true, b: true, c: false } }, { color: 'blue', shape: 'triangle', features: { a: true, b: false, c: false } }, { color: 'green', shape: 'circle' }] })('foo')({ color: 'red' })('features')('a')()).to.equal(true);
    });
  });
});

//If ask is...
//   a string - dereference by property, and return updated inspector
//   an object
//   an array
//   a function
//   no args - return the value of source
