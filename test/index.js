'use strict';

/* eslint-env mocha */

/* Dependencies. */
var assert = require('assert');
var english = require('parse-english');
var gemoji = require('gemoji');
var emoji = require('..');

/* Fixtures. */
var sob = require('./fixtures/sob');
var sobsob = require('./fixtures/sobsob');
var left = require('./fixtures/colons-left');
var right = require('./fixtures/colons-right');
var both = require('./fixtures/colons-both');
var trololol = require('./fixtures/trololol');
var smith = require('./fixtures/smith');
var cry = require('./fixtures/cry');
var word = require('./fixtures/word');
var wordOnly = require('./fixtures/word-only');
var adjacentEmoji = require('./fixtures/adjacent-emoji');
var adjacentGemoji = require('./fixtures/adjacent-gemoji');
var initialEmoji = require('./fixtures/initial-emoji');
var initialGemoji = require('./fixtures/initial-gemoji');
var inWords = require('./fixtures/in-words');

var baseSentence = 'Lack of cross-device emoji support makes me ';
var fullStop = '.';

/* Methods. */
var equal = assert.strictEqual;
var dequal = assert.deepEqual;

/* Processors. */
var position = english();
var noPosition = english({position: false});

position.useFirst('tokenizeSentence', emoji);
noPosition.useFirst('tokenizeSentence', emoji);

/*
 * Tests.
 */

describe('nlcst-emoji-modifier()', function () {
  it('should throw when not given a parent', function () {
    assert.throws(function () {
      emoji({});
    }, /Missing children in `parent/);
  });

  it('should classify gemoji (`:sob:`)', function () {
    check('This makes me feel :sob:.', sob);
  });

  it('should classify two adjacent gemoji (`:sob::sob:`)', function () {
    check('It\'s raining :sob::sob:', sobsob);
  });

  it('should support extra colons (`::sob::`)', function () {
    check('It\'s raining ::cat::dog::s', both);
  });

  it('should support extra left colons (`::sob:`)', function () {
    check('It\'s raining :::cat:s', left);
  });

  it('should support extra right colons (`:sob::`)', function () {
    check('It\'s raining :dog:::s', right);
  });

  it('should NOT classify invalid gemoji (`:trololol:`)', function () {
    check('trololol: This makes me feel :trololol:.', trololol);
  });

  it('should NOT classify invalid gemoji (`L.L. Smith:`)', function () {
    check('Hello L.L. Smith:\n', smith);
  });

  it('should classify unicode emoji (`\ud83d\ude2d`)', function () {
    check('This makes me feel \ud83d\ude2d.', cry);
  });

  /* Test for by parse-latin incorrectly classified
   * emoji: Some emoji are split over multiple nodes
   * (as they contain letter symbols), such as :v: and
   * :relaxed: (the latter tested below). */
  it('should classify emoji with word characters', function () {
    check('This makes me feel \u263a\ufe0f.', word);
  });

  /* Test for by parse-latin incorrectly classified
   * emoji: Some emoji are marked as words (as they
   * contain only letter symbols), such as :one: and
   * :i: (the first tested below). */
  it('should classify emoji with word only characters', function () {
    check('This makes me feel \u0031\ufe0f\u20e3.', wordOnly);
  });

  it('should classify adjacent emoji', function () {
    check('This makes me feel \ud83d\udc4d \ud83d\udc4e.', adjacentEmoji);
  });

  it('should classify adjacent gemoji', function () {
    check('This makes me feel :+1: :-1:.', adjacentGemoji);
  });

  it('should classify initial emoji', function () {
    check('\ud83d\udca4 I\'m going to bed.', initialEmoji);
  });

  it('should classify initial gemoji', function () {
    check(':zzz: I\'m going to bed.', initialGemoji);
  });

  it('should classify gemoji in words', function () {
    check('It\'s raining :cat:s and :dog:s.', inWords);
  });
});

Object.keys(gemoji.name).forEach(function (key) {
  var shortcode = ':' + key + ':';
  var emoji = gemoji.name[key].emoji;

  describe(emoji, function () {
    [shortcode, emoji].forEach(function (value) {
      it(
        'should classify `' + value + '`',
        function () {
          var node = position.parse(baseSentence + value + fullStop);
          var emoticon = node.children[0].children[0].children[14];

          equal(emoticon.type, 'EmoticonNode');
          equal(emoticon.value, value);
        }
      );
    });
  });
});

/* Short-cut to assert both positional and non-positional. */
function check(fixture, node) {
  dequal(position.parse(fixture), node);
  dequal(noPosition.parse(fixture), clean(node));
}

/* Clone `object` but omit positional information. */
function clean(object) {
  var clone = 'length' in object ? [] : {};
  var key;
  var value;

  for (key in object) {
    value = object[key];

    if (key === 'position') {
      continue;
    }

    clone[key] = typeof object[key] === 'object' ? clean(value) : value;
  }

  return clone;
}
