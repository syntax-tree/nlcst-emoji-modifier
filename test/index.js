'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var test = require('tape');
var english = require('parse-english');
var negate = require('negate');
var hidden = require('is-hidden');
var toString = require('nlcst-to-string');
var removePosition = require('unist-util-remove-position');
var gemoji = require('gemoji');
var emoji = require('..');

var position = english();
var noPosition = english();
noPosition.position = false;

position.useFirst('tokenizeSentence', emoji);
noPosition.useFirst('tokenizeSentence', emoji);

test('nlcst-emoji-modifier()', function (t) {
  var root = path.join(__dirname, 'fixtures');

  t.throws(
    function () {
      emoji({});
    },
    /Missing children in `parent/,
    'should throw when not given a parent'
  );

  fs
    .readdirSync(root)
    .filter(negate(hidden))
    .forEach(function (filename) {
      var tree = JSON.parse(fs.readFileSync(path.join(root, filename)));
      var fixture = toString(tree);
      var name = path.basename(filename, path.extname(filename));

      t.deepEqual(position.parse(fixture), tree, name);
      t.deepEqual(noPosition.parse(fixture), removePosition(tree, true), name + ' (positionless)');
    });

  t.end();
});

test('all gemoji', function (t) {
  Object.keys(gemoji.name).forEach(function (key) {
    var shortcode = ':' + key + ':';
    var emoji = gemoji.name[key].emoji;

    [shortcode, emoji].forEach(function (value) {
      t.doesNotThrow(
        function () {
          var fixture = 'Lack of cross-device emoji support makes me ' + value + '.';
          var node = position.parse(fixture);
          var emoticon = node.children[0].children[0].children[14];

          assert.equal(emoticon.type, 'EmoticonNode');
          assert.equal(emoticon.value, value);
        },
        value
      );
    });
  });

  t.end();
});
