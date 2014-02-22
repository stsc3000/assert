import {assert} from 'assert';



describe('basic type check', function() {

  class Type {}

  it('should pass', function() {
    assert.type(new Type(), Type);
  });


  it('should fail', function() {
    expect(() => assert.type(123, Type))
      .toThrowError('Expected an instance of Type, got 123!');
  });
});


describe('custom check', function() {

  class Type {}

  it('should pass when returns true', function() {
    Type.assert = function(value) {
      return true;
    };

    assert.type({}, Type);
  });


  it('should fail when returns false', function() {
    Type.assert = function(value) {
      return false;
    };

    expect(() => assert.type({}, Type))
      .toThrowError('Expected an instance of Type, got {}!');
  });


  it('should fail when calls assert.fail()', function() {
    Type.assert = function(value) {
      assert.fail('not smart enough');
      assert.fail('not blue enough');
    };

    expect(() => assert.type({}, Type))
      .toThrowError('Expected an instance of Type, got {}!\n' +
                    '  - not smart enough\n' +
                    '  - not blue enough');
  });


  it('should fail when throws an exception', function() {
    Type.assert = function(value) {
      throw new Error('not long enough');
    };

    expect(function() {
      assert.type(null, Type);
    }).toThrowError('Expected an instance of Type, got null!\n' +
                    '  - not long enough');
  });
});


describe('primitive value check', function() {

  describe('string', function() {

    it('should pass', function() {
      assert.type('xxx', assert.string);
    });


    it('should fail', function() {
      expect(() => assert.type(null, assert.string))
        .toThrowError('Expected an instance of string, got null!');
    });
  });


  describe('number', function() {

    it('should pass', function() {
      assert.type(123, assert.number);
    });


    it('should fail', function() {
      expect(() => assert.type(false, assert.number))
        .toThrowError('Expected an instance of number, got false!');
    });
  });


  describe('boolean', function() {

    it('should pass', function() {
      assert.type(true, assert.boolean);
      assert.type(false, assert.boolean);
    });


    it('should fail', function() {
      expect(() => assert.type(123, assert.boolean))
        .toThrowError('Expected an instance of boolean, got 123!');
    });
  });
});


describe('define', function() {

  it('should define assert for an existing type', function() {
    class Type {}

    assert.define(Type, function(value) {
      assert(value).is(Function, Object);
    });

    assert.type({}, Type);
    assert.type(function() {}, Type);
    expect(() => assert.type('str', Type))
      .toThrowError('Expected an instance of Type, got "str"!\n' +
                    '  - "str" is not instance of Function\n' +
                    '  - "str" is not instance of Object');
  });


  it('should define an interface', function() {
    var User = assert.define('MyUser', function(user) {
      assert(user).is(Object);
    });

    assert.type({}, User);
    expect(() => assert.type(12345, User))
      .toThrowError('Expected an instance of MyUser, got 12345!\n' +
                    '  - 12345 is not instance of Object');
  });


  describe('arrayOf', function() {

    var Titles = assert.define('ListOfTitles', function(value) {
      assert(value).is(assert.arrayOf(assert.string, assert.number));
    });

    it('should pass', function () {
      assert.type(['one', 55, 'two'], Titles);
    });


    it('should fail when non-array given', function () {
      expect(() => assert.type(null, Titles))
        .toThrowError('Expected an instance of ListOfTitles, got null!\n' +
                      '  - null is not instance of array of string/number\n' +
                      '    - null is not instance of Array');
    });


    it('should fail when an invalid item in the array', function () {
      expect(() => assert.type(['aaa', true], Titles))
        .toThrowError('Expected an instance of ListOfTitles, got ["aaa", true]!\n' +
                      '  - ["aaa", true] is not instance of array of string/number\n' +
                      '    - true is not instance of string\n' +
                      '    - true is not instance of number');
    });
  });


  describe('structure', function() {

    var User = assert.define('MyUser', function(value) {
      assert(value).is(assert.structure({
        name: assert.string,
        age: assert.number
      }));
    });

    it('should pass', function () {
      assert.type({name: 'Vojta', age: 28}, User);
    });


    it('should fail when non-object given', function () {
      expect(() => assert.type(null, User))
        .toThrowError('Expected an instance of MyUser, got null!\n' +
                      '  - null is not instance of object with properties name, age\n' +
                      '    - null is not instance of Object');
    });


    it('should fail when an invalid property', function () {
      expect(() => assert.type({name: 'Vojta', age: true}, User))
        .toThrowError('Expected an instance of MyUser, got {name: "Vojta", age: true}!\n' +
                      '  - {name: "Vojta", age: true} is not instance of object with properties name, age\n' +
                      '    - true is not instance of number');
    });
  });
});


describe('Traceur', function() {

  describe('arguments', function() {

    function reverse(str: string) {
      return str ? reverse(str.substring(1)) + str[0] : ''
    }

    it('should pass', function() {
      expect(reverse('angular')).toBe('ralugna');
    });


    it('should fail', function() {
      expect(() => reverse(123))
        .toThrowError('Invalid arguments given!\n' +
                      '  - 1st argument has to be an instance of string, got 123');
    });
  });


  describe('return value', function() {

    function foo(bar): number {
      return bar;
    }

    it('should pass', function() {
      expect(foo(123)).toBe(123);
    });


    it('should fail', function() {
      expect(() => foo('bar'))
        .toThrowError('Expected to return an instance of number, got "bar"!');
    });
  });


  describe('variables', function() {

    it('should pass', function() {
      var count:number = 1;
    });


    it('should fail', function() {
      expect(() => {
        var count: number = null;
      }).toThrowError('Expected an instance of number, got null!');
    });
  });
});
