/**
 * @typedef {import('nlcst').Parents} Parents
 * @typedef {import('nlcst').Sentence} Sentence
 * @typedef {import('nlcst-emoticon-modifier').Emoticon} Emoticon
 * @typedef {import('unist').Point} Point
 */

/**
 * @typedef {import('unist-util-visit-parents').InclusiveDescendant<Sentence>} SentenceInclusiveDescendant
 * @typedef {Extract<SentenceInclusiveDescendant, Parents>} SentenceInclusiveDescendantParents
 * @typedef {Exclude<SentenceInclusiveDescendant, Parents>} SentenceInclusiveDescendantLeafs
 *
 * @typedef FindMatch
 * @property {number} start
 * @property {number} end
 *
 * @typedef ChangeResult
 * @property {number} end
 * @property {Array<SentenceInclusiveDescendant>} nodes
 */

import emojiRegex from 'emoji-regex'
import {nameToEmoji} from 'gemoji'
import {toString} from 'nlcst-to-string'
import {generated} from 'unist-util-generated'
import {pointEnd, pointStart, position} from 'unist-util-position'

const own = {}.hasOwnProperty

/**
 * Classify emoji (👍) and Gemoji (GitHub emoji, :+1:) in `node` as
 * `Emoticon`s.
 *
 * @param {Sentence} node
 *   Sentence to transform.
 * @returns {undefined}
 *   Nothing.
 */
export function emojiModifier(node) {
  if (!node || !node.children) {
    throw new Error('Missing children in `parent`')
  }

  /** @type {Map<Emoticon, FindMatch>} */
  const matchMap = new Map()

  // @ts-expect-error: assume content model matches (no sentences in sentences).
  node.children = changeParent(node, findEmoji(node), 0).nodes

  /**
   * Add emoji in a parent.
   *
   * @param {SentenceInclusiveDescendantParents} node
   *   Node to change.
   * @param {Array<FindMatch>} matches
   *   Emoji in `node`.
   * @param {number} start
   *   Where `node` starts.
   * @returns {ChangeResult}
   *   Result.
   */
  function changeParent(node, matches, start) {
    let end = start
    let index = -1
    /** @type {Array<SentenceInclusiveDescendant>} */
    const nodes = []
    /** @type {Array<SentenceInclusiveDescendant>} */
    const merged = []
    /** @type {SentenceInclusiveDescendant | undefined} */
    let previous

    while (++index < node.children.length) {
      const child = node.children[index]
      const result =
        'children' in child
          ? changeParent(child, matches, end)
          : changeLeaf(child, matches, end)
      nodes.push(...result.nodes)
      end = result.end
    }

    index = -1

    while (++index < nodes.length) {
      const child = nodes[index]

      if (child.type === 'EmoticonNode') {
        // Always exists if we run, but other tools like
        // `nlcst-emoticon-modifier` may not have it.
        const match = matchMap.get(child)

        if (
          match &&
          previous &&
          previous.type === 'EmoticonNode' &&
          matchMap.get(previous) === match
        ) {
          previous.value += child.value
          const end = pointEnd(child)

          if (previous.position && end) {
            previous.position.end = end
          }
        } else {
          previous = child
          merged.push(child)
        }
      } else {
        previous = undefined

        if (node.type === 'WordNode') {
          /** @type {typeof node} */
          // @ts-expect-error: assume content model matches (no words in words).
          const replacement = {type: node.type, children: [child]}

          if (!generated(child)) {
            replacement.position = position(child)
          }

          merged.push(replacement)
        } else {
          merged.push(child)
        }
      }
    }

    return {end, nodes: merged}
  }

  /**
   * Add emoji in a non-parent.
   *
   * @param {SentenceInclusiveDescendantLeafs} node
   *   Node to change.
   * @param {Array<FindMatch>} matches
   *   Emoji in `node`.
   * @param {number} start
   *   Where `node` starts.
   * @returns {ChangeResult}
   *   Result.
   */
  function changeLeaf(node, matches, start) {
    const value = toString(node)
    const point = generated(node) ? undefined : pointStart(node)
    /** @type {Array<SentenceInclusiveDescendantLeafs>} */
    const nodes = []
    const end = start + value.length
    let index = -1
    let textEnd = 0

    while (++index < matches.length) {
      const match = matches[index]
      let emojiEnd = match.end - start + 1

      if (match.start - start < value.length && emojiEnd > 0) {
        if (match.start - start > textEnd) {
          /** @type {typeof node} */
          const child = {
            type: node.type,
            value: value.slice(textEnd, match.start - start)
          }

          if (point) {
            child.position = {
              start: shift(point, textEnd),
              end: shift(point, match.start - start)
            }
          }

          nodes.push(child)
          textEnd = match.start - start
        }

        if (emojiEnd > value.length) {
          emojiEnd = value.length
        }

        /** @type {Emoticon} */
        const child = {
          type: 'EmoticonNode',
          value: value.slice(textEnd, emojiEnd)
        }

        matchMap.set(child, match)

        if (point) {
          child.position = {
            start: shift(point, textEnd),
            end: shift(point, emojiEnd)
          }
        }

        nodes.push(child)
        textEnd = emojiEnd
      }
    }

    if (textEnd < value.length) {
      /** @type {typeof node} */
      const child = {type: node.type, value: value.slice(textEnd)}

      if (point && node.position) {
        child.position = {start: shift(point, textEnd), end: node.position.end}
      }

      nodes.push(child)
    }

    return {end, nodes}
  }
}

/**
 * @param {Sentence} node
 *   Find emoji in a sentence.
 * @returns {Array<FindMatch>}
 *   Matches.
 */
function findEmoji(node) {
  const emojiExpression = emojiRegex()
  /** @type {Array<FindMatch>} */
  const matches = []
  const value = toString(node)
  let start = value.indexOf(':')
  let end = start === -1 ? -1 : value.indexOf(':', start + 1)

  // Get Gemoji shortcodes.
  while (end !== -1) {
    const slice = value.slice(start + 1, end)

    if (own.call(nameToEmoji, slice)) {
      matches.push({start, end})
      start = value.indexOf(':', end + 1)
    } else {
      start = end
    }

    end = start === -1 ? -1 : value.indexOf(':', start + 1)
  }

  /** @type {RegExpExecArray | null} */
  let match

  // Get emoji.
  while ((match = emojiExpression.exec(value))) {
    const start = match.index
    let end = start + match[0].length - 1

    if (value.charCodeAt(end + 1) === 0xfe_0f) {
      end++
    }

    matches.push({start, end})
  }

  matches.sort(sort)

  return matches
}

/**
 * Sort matches: earlier comes earlier.
 *
 * @param {FindMatch} a
 *   Match a.
 * @param {FindMatch} b
 *   Match b.
 * @returns {number}
 *   Sorting.
 */
function sort(a, b) {
  return a.start - b.start
}

/**
 * Create a shifted point.
 *
 * > 👉 **Note**: this cannot shift accros lines.
 * > It also breaks for escapes and such.
 *
 * @param {Point} point
 *   Original point.
 * @param {number} offset
 *   Number to shift.
 * @returns {Point}
 *   Shifted point.
 */
function shift(point, offset) {
  return {
    line: point.line,
    column: point.column + offset,
    offset: (point.offset || 0) + offset
  }
}
