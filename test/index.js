/**
 * @typedef {import('nlcst').Nodes} Nodes
 * @typedef {import('nlcst').Root} Root
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'
import {ParseEnglish} from 'parse-english'
import {isHidden} from 'is-hidden'
import {toString} from 'nlcst-to-string'
import {u} from 'unist-builder'
import {gemoji} from 'gemoji'
import {emojiModifier} from '../index.js'
import * as mod from '../index.js'

const parser = new ParseEnglish()

// @ts-expect-error: can be removed when `plugin` yields `undefined`.
parser.tokenizeSentencePlugins.unshift(emojiModifier)

const vs16 = '\uFE0F'

test('emojiModifier', async () => {
  assert.deepEqual(
    Object.keys(mod).sort(),
    ['emojiModifier'],
    'should expose the public api'
  )

  assert.throws(
    () => {
      // @ts-expect-error runtime.
      emojiModifier({})
    },
    /Missing children in `parent/,
    'should throw when not given a parent'
  )

  assert.deepEqual(
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

  assert.deepEqual(
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

  assert.deepEqual(
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

  assert.deepEqual(
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

  const root = new URL('fixtures/', import.meta.url)
  const files = await fs.readdir(root)
  let index = -1

  while (++index < files.length) {
    const file = files[index]

    if (isHidden(file)) continue

    /** @type {Root} */
    const tree = JSON.parse(String(await fs.readFile(new URL(file, root))))
    const name = file.split('.').slice(0, -1).join('.')
    const input = toString(tree)

    assert.deepEqual(parser.parse(input), tree, name)
  }
})

test('all emoji and gemoji', () => {
  let index = -1
  while (++index < gemoji.length) {
    const info = gemoji[index]

    const shortcode = ':' + info.names[0] + ':'
    const emoji = info.emoji

    assert.doesNotThrow(() => {
      const fixture = 'Alpha ' + shortcode + ' bravo.'
      const tree = parser.parse(fixture)
      /** @type {Nodes} */
      // @ts-expect-error: cleaner delve.
      const node = tree.children[0].children[0].children[2]

      assert.ok(node.type === 'EmoticonNode', 'type')
      assert.equal(node.value, shortcode, 'value')
    }, shortcode)

    assert.doesNotThrow(() => {
      let expected = emoji
      let tree = parser.parse('Alpha ' + emoji + ' bravo.')
      /** @type {Nodes} */
      // @ts-expect-error: cleaner delve.
      let node = tree.children[0].children[0].children[2]

      // Try with variant selector.
      if (node.type !== 'EmoticonNode' || node.value !== expected) {
        expected =
          expected.charAt(expected.length - 1) === vs16
            ? expected
            : expected + vs16
        tree = parser.parse('Alpha ' + expected + ' bravo.')
        // @ts-expect-error: cleaner delve.
        node = tree.children[0].children[0].children[2]

        // Try without variant selector.
        if (node.type !== 'EmoticonNode' || node.value !== expected) {
          expected = expected.slice(0, -1)
          tree = parser.parse('Alpha ' + expected + ' bravo.')
          // @ts-expect-error: cleaner delve.
          node = tree.children[0].children[0].children[2]
        }
      }

      assert.ok(node.type === 'EmoticonNode')
      assert.equal(node.value, expected)
    }, emoji)
  }
})
