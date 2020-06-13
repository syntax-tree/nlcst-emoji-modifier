'use strict'

var fs = require('fs')
var path = require('path')
var assert = require('assert')
var test = require('tape')
var english = require('parse-english')
var negate = require('negate')
var hidden = require('is-hidden')
var toString = require('nlcst-to-string')
var removePosition = require('unist-util-remove-position')
var u = require('unist-builder')
var gemoji = require('gemoji')
var emoji = require('..')

var position = english()
var noPosition = english()
noPosition.position = false

position.useFirst('tokenizeSentence', emoji)
noPosition.useFirst('tokenizeSentence', emoji)

test('emojiModifier()', function (t) {
  var root = path.join(__dirname, 'fixtures')

  t.throws(
    function () {
      emoji({})
    },
    /Missing children in `parent/,
    'should throw when not given a parent'
  )

  t.deepEqual(
    emoji(
      u('SentenceNode', [
        u('WordNode', [u('TextNode', 'Alpha')]),
        u('WhiteSpaceNode', ' '),
        u('PunctuationNode', ':'),
        u('WordNode', [
          u('TextNode', 'south'),
          u('PunctuationNode', '_'),
          u('TextNode', 'georgia'),
          u('PunctuationNode', '_'),
          u('TextNode', 'south'),
          u('PunctuationNode', '_'),
          u('TextNode', 'sandwich'),
          u('PunctuationNode', '_'),
          u('TextNode', 'islands')
        ]),
        u('PunctuationNode', ':')
      ])
    ),
    u('SentenceNode', [
      u('WordNode', [u('TextNode', 'Alpha')]),
      u('WhiteSpaceNode', ' '),
      u('EmoticonNode', ':south_georgia_south_sandwich_islands:')
    ]),
    'should merge whole words with surrounding punctuation'
  )

  t.deepEqual(
    emoji(
      u('SentenceNode', [
        u('WordNode', [u('TextNode', 'Alpha')]),
        u('WhiteSpaceNode', ' '),
        u('PunctuationNode', ':'),
        u('PunctuationNode', '-'),
        u('WordNode', [u('TextNode', '1')]),
        u('PunctuationNode', ':')
      ])
    ),
    u('SentenceNode', [
      u('WordNode', [u('TextNode', 'Alpha')]),
      u('WhiteSpaceNode', ' '),
      u('EmoticonNode', ':-1:')
    ]),
    'should merge punctuation and words'
  )

  t.deepEqual(
    emoji(
      u('SentenceNode', [
        u('WordNode', [u('TextNode', 'Alpha')]),
        u('WhiteSpaceNode', ' '),
        u('PunctuationNode', ':'),
        u('SymbolNode', '+'),
        u('WordNode', [u('TextNode', '1')]),
        u('PunctuationNode', ':')
      ])
    ),
    u('SentenceNode', [
      u('WordNode', [u('TextNode', 'Alpha')]),
      u('WhiteSpaceNode', ' '),
      u('EmoticonNode', ':+1:')
    ]),
    'should merge punctuation, symbols, words'
  )

  fs.readdirSync(root)
    .filter(negate(hidden))
    .forEach(function (filename) {
      var tree = JSON.parse(fs.readFileSync(path.join(root, filename)))
      var fixture = toString(tree)
      var name = path.basename(filename, path.extname(filename))

      t.deepEqual(position.parse(fixture), tree, name)
      t.deepEqual(
        noPosition.parse(fixture),
        removePosition(tree, true),
        name + ' (positionless)'
      )
    })

  t.end()
})

test('all emoji and gemoji', function (t) {
  var force = '\uFE0F'

  Object.keys(gemoji.name).forEach(function (key) {
    var shortcode = ':' + key + ':'
    var emoji = gemoji.name[key].emoji

    // Old github/gemoji used one FE0F variant selector.
    // That’s changed in the beta, so use the future (and correct) version.
    if (emoji === '👁‍🗨') {
      emoji = '👁️‍🗨️'
    }

    t.doesNotThrow(function () {
      var fixture = 'Alpha ' + shortcode + ' bravo.'
      var tree = position.parse(fixture)
      var node = tree.children[0].children[0].children[2]

      assert.strictEqual(node.type, 'EmoticonNode', 'type')
      assert.strictEqual(node.value, shortcode, 'value')
    }, shortcode)

    t.doesNotThrow(function () {
      var expected = emoji
      var tree = position.parse('Alpha ' + emoji + ' bravo.')
      var node = tree.children[0].children[0].children[2]

      // Try with variant selector.
      if (node.type !== 'EmoticonNode' || node.value !== expected) {
        expected =
          expected.charAt(expected.length - 1) === force
            ? expected
            : expected + force
        tree = position.parse('Alpha ' + expected + ' bravo.')
        node = tree.children[0].children[0].children[2]

        // Try without variant selector.
        if (node.type !== 'EmoticonNode' || node.value !== expected) {
          expected = expected.slice(0, -1)
          tree = position.parse('Alpha ' + expected + ' bravo.')
          node = tree.children[0].children[0].children[2]
        }
      }

      assert.strictEqual(node.type, 'EmoticonNode')
      assert.strictEqual(node.value, expected)
    }, emoji)
  })

  t.end()
})
