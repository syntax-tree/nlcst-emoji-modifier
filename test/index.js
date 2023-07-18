/**
 * @typedef {import('nlcst').Root} Root
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'
import {gemoji} from 'gemoji'
import {isHidden} from 'is-hidden'
import {toString} from 'nlcst-to-string'
import {ParseEnglish} from 'parse-english'
import {u} from 'unist-builder'
import {emojiModifier} from '../index.js'

const parser = new ParseEnglish()

parser.tokenizeSentencePlugins.unshift(emojiModifier)

const vs16 = '\uFE0F'

test('emojiModifier', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('../index.js')).sort(), [
      'emojiModifier'
    ])
  })

  await t.test('should throw when not given a parent', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how a non-set is handled
      emojiModifier({type: 'TextNode', value: 'Alpha'})
    }, /Missing children in `parent/)
  })

  await t.test(
    'should merge whole words with surrounding punctuation',
    async function () {
      const tree = u('SentenceNode', [
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

      emojiModifier(tree)

      assert.deepEqual(
        tree,
        u('SentenceNode', [
          u('WordNode', [u('TextNode', 'Alpha')]),
          u('WhiteSpaceNode', ' '),
          u('EmoticonNode', ':south_georgia_south_sandwich_islands:')
        ])
      )
    }
  )

  await t.test('should merge punctuation and words', async function () {
    const tree = u('SentenceNode', [
      u('WordNode', [u('TextNode', 'Alpha')]),
      u('WhiteSpaceNode', ' '),
      u('PunctuationNode', ':'),
      u('PunctuationNode', '-'),
      u('WordNode', [u('TextNode', '1')]),
      u('PunctuationNode', ':')
    ])

    emojiModifier(tree)

    assert.deepEqual(
      tree,
      u('SentenceNode', [
        u('WordNode', [u('TextNode', 'Alpha')]),
        u('WhiteSpaceNode', ' '),
        u('EmoticonNode', ':-1:')
      ])
    )
  })

  await t.test('should merge punctuation, symbols, words', async function () {
    const tree = u('SentenceNode', [
      u('WordNode', [u('TextNode', 'Alpha')]),
      u('WhiteSpaceNode', ' '),
      u('PunctuationNode', ':'),
      u('SymbolNode', '+'),
      u('WordNode', [u('TextNode', '1')]),
      u('PunctuationNode', ':')
    ])

    emojiModifier(tree)

    assert.deepEqual(
      tree,
      u('SentenceNode', [
        u('WordNode', [u('TextNode', 'Alpha')]),
        u('WhiteSpaceNode', ' '),
        u('EmoticonNode', ':+1:')
      ])
    )
  })

  await t.test(
    'should support a by GH not required variant selector',
    async function () {
      const tree = u('SentenceNode', [
        u('WordNode', [u('TextNode', 'Zap')]),
        u('WhiteSpaceNode', ' '),
        u('SymbolNode', '⚡'),
        u('WordNode', [u('TextNode', '️')]),
        u('PunctuationNode', '.')
      ])

      emojiModifier(tree)

      assert.deepEqual(
        tree,
        u('SentenceNode', [
          u('WordNode', [u('TextNode', 'Zap')]),
          u('WhiteSpaceNode', ' '),
          u('EmoticonNode', '⚡️'),
          u('PunctuationNode', '.')
        ])
      )
    }
  )
})

test('fixtures', async function (t) {
  const root = new URL('fixtures/', import.meta.url)
  const files = await fs.readdir(root)
  let index = -1

  while (++index < files.length) {
    const file = files[index]

    if (isHidden(file)) continue

    const name = file.split('.').slice(0, -1).join('.')

    await t.test(name, async function () {
      /** @type {Root} */
      const tree = JSON.parse(String(await fs.readFile(new URL(file, root))))
      const input = toString(tree)

      assert.deepEqual(parser.parse(input), tree, name)
    })
  }
})

test('all emoji and gemoji', async function (t) {
  let index = -1

  while (++index < gemoji.length) {
    const info = gemoji[index]
    const shortcode = ':' + info.names[0] + ':'
    const emoji = info.emoji

    await t.test(shortcode + ': ' + emoji, async function () {
      assert.doesNotThrow(function () {
        const fixture = 'Alpha ' + shortcode + ' bravo.'
        const tree = parser.parse(fixture)
        const paragraph = tree.children[0]
        assert(paragraph.type === 'ParagraphNode')
        const sentence = paragraph.children[0]
        assert(sentence.type === 'SentenceNode')
        const node = sentence.children[2]
        assert(node.type === 'EmoticonNode')
        assert.equal(node.value, shortcode)
      })

      assert.doesNotThrow(function () {
        let expected = emoji
        const tree = parser.parse('Alpha ' + emoji + ' bravo.')
        const paragraph = tree.children[0]
        assert(paragraph.type === 'ParagraphNode')
        const sentence = paragraph.children[0]
        assert(sentence.type === 'SentenceNode')
        let node = sentence.children[2]

        // Try with variant selector.
        if (node.type !== 'EmoticonNode' || node.value !== expected) {
          expected =
            expected.charAt(expected.length - 1) === vs16
              ? expected
              : expected + vs16
          const tree = parser.parse('Alpha ' + expected + ' bravo.')
          const paragraph = tree.children[0]
          assert(paragraph.type === 'ParagraphNode')
          const sentence = paragraph.children[0]
          assert(sentence.type === 'SentenceNode')
          node = sentence.children[2]

          // Try without variant selector.
          if (node.type !== 'EmoticonNode' || node.value !== expected) {
            expected = expected.slice(0, -1)
            const tree = parser.parse('Alpha ' + expected + ' bravo.')
            const paragraph = tree.children[0]
            assert(paragraph.type === 'ParagraphNode')
            const sentence = paragraph.children[0]
            assert(sentence.type === 'SentenceNode')
            node = sentence.children[2]
          }
        }

        assert(node.type === 'EmoticonNode')
        assert.equal(node.value, expected)
      })
    })
  }
})
