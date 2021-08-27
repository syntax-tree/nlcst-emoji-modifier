/**
 * @typedef {import('nlcst').Root} Root
 */

import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert'
import test from 'tape'
// @ts-expect-error Remove when typed.
import {ParseEnglish} from 'parse-english'
import {isHidden} from 'is-hidden'
import {toString} from 'nlcst-to-string'
import {removePosition} from 'unist-util-remove-position'
import {u} from 'unist-builder'
import {gemoji} from 'gemoji'
import {emojiModifier} from '../index.js'

const position = new ParseEnglish()
const noPosition = new ParseEnglish()
noPosition.position = false

position.useFirst('tokenizeSentence', emojiModifier)
noPosition.useFirst('tokenizeSentence', emojiModifier)

const vs16 = '\uFE0F'

test('emojiModifier()', (t) => {
  const root = path.join('test', 'fixtures')

  t.throws(
    () => {
      // @ts-expect-error runtime.
      emojiModifier({})
    },
    /Missing children in `parent/,
    'should throw when not given a parent'
  )

  t.deepEqual(
    emojiModifier(
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
    emojiModifier(
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
    emojiModifier(
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

  t.deepEqual(
    emojiModifier(
      u('SentenceNode', [
        u('WordNode', [u('TextNode', 'Zap')]),
        u('WhiteSpaceNode', ' '),
        u('SymbolNode', '⚡'),
        u('WordNode', [u('TextNode', '️')]),
        u('PunctuationNode', '.')
      ])
    ),
    u('SentenceNode', [
      u('WordNode', [u('TextNode', 'Zap')]),
      u('WhiteSpaceNode', ' '),
      u('EmoticonNode', '⚡️'),
      u('PunctuationNode', '.')
    ]),
    'should support a by GH not required variant selector'
  )

  const files = fs.readdirSync(root)
  let index = -1

  while (++index < files.length) {
    if (isHidden(files[index])) continue

    /** @type {Root} */
    const tree = JSON.parse(
      String(fs.readFileSync(path.join(root, files[index])))
    )
    const name = path.basename(files[index], path.extname(files[index]))

    t.deepEqual(position.parse(toString(tree)), tree, name)
    t.deepEqual(
      noPosition.parse(toString(tree)),
      removePosition(tree, true),
      name + ' (positionless)'
    )
  }

  t.end()
})

test('all emoji and gemoji', (t) => {
  let index = -1
  while (++index < gemoji.length) {
    const info = gemoji[index]

    const shortcode = ':' + info.names[0] + ':'
    const emoji = info.emoji

    t.doesNotThrow(() => {
      const fixture = 'Alpha ' + shortcode + ' bravo.'
      const tree = position.parse(fixture)
      const node = tree.children[0].children[0].children[2]

      assert.strictEqual(node.type, 'EmoticonNode', 'type')
      assert.strictEqual(node.value, shortcode, 'value')
    }, shortcode)

    t.doesNotThrow(() => {
      let expected = emoji
      let tree = position.parse('Alpha ' + emoji + ' bravo.')
      let node = tree.children[0].children[0].children[2]

      // Try with variant selector.
      if (node.type !== 'EmoticonNode' || node.value !== expected) {
        expected =
          expected.charAt(expected.length - 1) === vs16
            ? expected
            : expected + vs16
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
  }

  t.end()
})
