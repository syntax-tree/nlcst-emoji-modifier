'use strict'

var visit = require('unist-util-visit')
var position = require('unist-util-position')
var generated = require('unist-util-generated')
var toString = require('nlcst-to-string')
var gemojiNameToEmoji = require('gemoji/name-to-emoji')
var emojiRegex = require('emoji-regex')

module.exports = mergeEmoji

var own = {}.hasOwnProperty
var colon = ':'

var vs16 = 0xfe0f

// Merge emoji (👍) and Gemoji (GitHub emoji, :+1:).
function mergeEmoji(node) {
  if (!node || !node.children) {
    throw new Error('Missing children in `parent`')
  }

  var matches = findEmoji(node)
  var result = changeParent(node, matches, 0)

  node.children = result.nodes

  visit(node, 'EmoticonNode', removeMatch)

  return node
}

function changeParent(node, matches, start) {
  var children = node.children
  var length = children.length
  var end = start
  var index = -1
  var nodes = []
  var result
  var child
  var merged
  var previous
  var parent

  while (++index < length) {
    child = children[index]

    if (child.children) {
      result = changeParent(child, matches, end)
    } else {
      result = changeLeaf(child, matches, end)
    }

    nodes = nodes.concat(result.nodes)
    end = result.end
  }

  index = -1
  length = nodes.length
  merged = []

  while (++index < length) {
    child = nodes[index]

    if (child.type === 'EmoticonNode') {
      if (previous && previous.match === child.match) {
        previous.value += child.value

        if (!generated(previous)) {
          previous.position.end = position.end(child)
        }
      } else {
        previous = child
        merged.push(child)
      }
    } else {
      previous = null

      if (node.type === 'WordNode') {
        parent = {type: node.type, children: [child]}

        if (!generated(child)) {
          parent.position = {
            start: position.start(child),
            end: position.end(child)
          }
        }

        merged.push(parent)
      } else {
        merged.push(child)
      }
    }
  }

  return {end: end, nodes: merged}
}

function changeLeaf(node, matches, start) {
  var value = toString(node)
  var point = generated(node) ? null : position.start(node)
  var end = start + value.length
  var length = matches.length
  var index = -1
  var textEnd = 0
  var nodes = []
  var emojiBegin
  var emojiEnd
  var child
  var match

  while (++index < length) {
    match = matches[index]
    emojiBegin = match.start - start
    emojiEnd = match.end - start + 1

    if (emojiBegin < value.length && emojiEnd > 0) {
      if (emojiBegin > textEnd) {
        child = {type: node.type, value: value.slice(textEnd, emojiBegin)}

        if (point) {
          child.position = {
            start: shift(point, textEnd),
            end: shift(point, emojiBegin)
          }
        }

        nodes.push(child)
        textEnd = emojiBegin
      }

      if (emojiEnd > value.length) {
        emojiEnd = value.length
      }

      child = {
        type: 'EmoticonNode',
        value: value.slice(textEnd, emojiEnd),
        match: match
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
    child = {type: node.type, value: value.slice(textEnd)}

    if (point) {
      child.position = {start: shift(point, textEnd), end: node.position.end}
    }

    nodes.push(child)
  }

  return {end: end, nodes: nodes}
}

function findEmoji(node) {
  var emojiExpression = emojiRegex()
  var matches = []
  var value = toString(node)
  var start = value.indexOf(colon)
  var end = start === -1 ? -1 : value.indexOf(colon, start + 1)
  var match

  // Get Gemoji shortcodes.
  while (end !== -1) {
    match = value.slice(start + 1, end)

    if (own.call(gemojiNameToEmoji, match)) {
      matches.push({start: start, end: end})
      start = value.indexOf(colon, end + 1)
    } else {
      start = end
    }

    end = start === -1 ? -1 : value.indexOf(colon, start + 1)
  }

  // Get emoji.
  while ((match = emojiExpression.exec(value))) {
    start = match.index
    end = start + match[0].length - 1

    if (value.charCodeAt(end + 1) === vs16) {
      end++
    }

    matches.push({start: start, end: end})
  }

  matches.sort(sort)

  return matches
}

function removeMatch(node) {
  delete node.match
}

function sort(a, b) {
  return a.start - b.start
}

function shift(point, offset) {
  return {
    line: point.line,
    column: point.column + offset,
    offset: point.offset + offset
  }
}
