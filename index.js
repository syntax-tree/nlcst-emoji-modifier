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

var own = {}.hasOwnProperty
var push = [].push

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
  var children = node.children
  var end = start
  var index = -1
  /** @type {Array.<Node>} */
  var nodes = []
  /** @type {Array.<Node>} */
  var merged = []
  /** @type {ChangeResult} */
  var result
  /** @type {Node} */
  var previous

  while (++index < children.length) {
    const child = children[index]
    result = parent(child)
      ? changeParent(child, matches, end)
      : changeLeaf(children[index], matches, end)
    push.apply(nodes, result.nodes)
    end = result.end
  }

  index = -1

  while (++index < nodes.length) {
    if (nodes[index].type === 'EmoticonNode') {
      // @ts-expect-error: custom fields.
      if (previous && previous._match === nodes[index]._match) {
        // @ts-ignore Both literals.
        previous.value += nodes[index].value

        if (!generated(previous)) {
          previous.position.end = pointEnd(nodes[index])
        }
      } else {
        previous = nodes[index]
        merged.push(nodes[index])
      }
    } else {
      previous = null

      if (node.type === 'WordNode') {
        /** @type {Parent} */
        const child = {type: node.type, children: [nodes[index]]}

        if (!generated(nodes[index])) {
          child.position = position(nodes[index])
        }

        merged.push(child)
      } else {
        merged.push(nodes[index])
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
  var value = toString(node)
  var point = generated(node) ? null : pointStart(node)
  var end = start + value.length
  var index = -1
  var textEnd = 0
  /** @type {Array.<Node>} */
  var nodes = []
  /** @type {number} */
  var emojiEnd
  /** @type {FindMatch} */
  var match

  while (++index < matches.length) {
    match = matches[index]
    emojiEnd = match.end - start + 1

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

    if (point) {
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
  var emojiExpression = emojiRegex()
  /** @type {Array.<FindMatch>} */
  var matches = []
  var value = toString(node)
  var start = value.indexOf(':')
  var end = start === -1 ? -1 : value.indexOf(':', start + 1)
  /** @type {string} */
  var slice
  /** @type {RegExpExecArray} */
  var match

  // Get Gemoji shortcodes.
  while (end !== -1) {
    slice = value.slice(start + 1, end)

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

    if (value.charCodeAt(end + 1) === 0xfe0f) {
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
    offset: point.offset + offset
  }
}

/**
 * @param {Node} node
 * @returns {node is Parent}
 */
function parent(node) {
  return 'children' in node
}
