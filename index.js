/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Literal<string>} Literal
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('unist').Point} Point
 * @typedef {Literal & {type: 'EmoticonNode', _match?: FindMatch}} EmoticonNode
 *
 * @typedef {Object} FindMatch
 * @property {number} start
 * @property {number} end
 *
 * @typedef {Object} ChangeResult
 * @property {Array.<Node>} nodes
 * @property {number} end
 */

import {visit} from 'unist-util-visit'
import {position, pointStart, pointEnd} from 'unist-util-position'
import {generated} from 'unist-util-generated'
import {toString} from 'nlcst-to-string'
import {nameToEmoji} from 'gemoji'
import emojiRegex from 'emoji-regex'

const own = {}.hasOwnProperty

/**
 * Merge emoji (👍) and Gemoji (GitHub emoji, :+1:).
 *
 * @param {Parent} node
 */
export function emojiModifier(node) {
  if (!node || !node.children) {
    throw new Error('Missing children in `parent`')
  }

  node.children = changeParent(node, findEmoji(node), 0).nodes

  visit(node, 'EmoticonNode', removeMatch)

  return node
}

/**
 * @param {Parent} node
 * @param {Array.<FindMatch>} matches
 * @param {number} start
 */
function changeParent(node, matches, start) {
  let end = start
  let index = -1
  /** @type {Array.<Node>} */
  const nodes = []
  /** @type {Array.<Node>} */
  const merged = []
  /** @type {Node|undefined} */
  let previous

  while (++index < node.children.length) {
    const child = node.children[index]
    const result = parent(child)
      ? changeParent(child, matches, end)
      : changeLeaf(child, matches, end)
    nodes.push(...result.nodes)
    end = result.end
  }

  index = -1

  while (++index < nodes.length) {
    const child = nodes[index]

    if (emoticon(child)) {
      if (previous && emoticon(previous) && previous._match === child._match) {
        previous.value += child.value

        if (!generated(previous)) {
          // @ts-expect-error: defined.
          previous.position.end = pointEnd(child)
        }
      } else {
        previous = child
        merged.push(child)
      }
    } else {
      previous = undefined

      if (node.type === 'WordNode') {
        /** @type {Parent} */
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
 * @param {Node} node
 * @param {Array.<FindMatch>} matches
 * @param {number} start
 * @returns {ChangeResult}
 */
function changeLeaf(node, matches, start) {
  const value = toString(node)
  const point = generated(node) ? undefined : pointStart(node)
  const end = start + value.length
  let index = -1
  let textEnd = 0
  /** @type {Array.<Node>} */
  const nodes = []

  while (++index < matches.length) {
    const match = matches[index]
    let emojiEnd = match.end - start + 1

    if (match.start - start < value.length && emojiEnd > 0) {
      if (match.start - start > textEnd) {
        /** @type {Literal} */
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

      /** @type {EmoticonNode} */
      const child = {
        type: 'EmoticonNode',
        value: value.slice(textEnd, emojiEnd),
        _match: match
      }

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
    /** @type {Literal} */
    const child = {type: node.type, value: value.slice(textEnd)}

    if (point && node.position) {
      child.position = {start: shift(point, textEnd), end: node.position.end}
    }

    nodes.push(child)
  }

  return {end, nodes}
}

/**
 * @param {Node} node
 */
function findEmoji(node) {
  const emojiExpression = emojiRegex()
  /** @type {Array.<FindMatch>} */
  const matches = []
  const value = toString(node)
  let start = value.indexOf(':')
  let end = start === -1 ? -1 : value.indexOf(':', start + 1)
  /** @type {RegExpExecArray|null} */
  let match

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

  // Get emoji.
  while ((match = emojiExpression.exec(value))) {
    start = match.index
    end = start + match[0].length - 1

    if (value.charCodeAt(end + 1) === 0xfe_0f) {
      end++
    }

    matches.push({start, end})
  }

  matches.sort(sort)

  return matches
}

/**
 * @param {EmoticonNode} node
 */
function removeMatch(node) {
  delete node._match
}

/**
 * @param {FindMatch} a
 * @param {FindMatch} b
 * @returns {number}
 */
function sort(a, b) {
  return a.start - b.start
}

/**
 * @param {Point} point
 * @param {number} offset
 * @returns {Point}
 */
function shift(point, offset) {
  return {
    line: point.line,
    column: point.column + offset,
    offset: (point.offset || 0) + offset
  }
}

/**
 * @param {Node} node
 * @returns {node is Parent}
 */
function parent(node) {
  return 'children' in node
}

/**
 * @param {Node} node
 * @returns {node is EmoticonNode}
 */
function emoticon(node) {
  return node.type === 'EmoticonNode'
}
