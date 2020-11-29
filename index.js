'use strict'

var visit = require('unist-util-visit')
var position = require('unist-util-position')
var generated = require('unist-util-generated')
var toString = require('nlcst-to-string')
var gemojiNameToEmoji = require('gemoji/name-to-emoji')
var emojiRegex = require('emoji-regex')

module.exports = mergeEmoji

var own = {}.hasOwnProperty
var push = [].push

// Merge emoji (👍) and Gemoji (GitHub emoji, :+1:).
function mergeEmoji(node) {
  if (!node || !node.children) {
    throw new Error('Missing children in `parent`')
  }

  node.children = changeParent(node, findEmoji(node), 0).nodes

  visit(node, 'EmoticonNode', removeMatch)

  return node
}

function changeParent(node, matches, start) {
  var children = node.children
  var end = start
  var index = -1
  var nodes = []
  var merged = []
  var result
  var previous

  while (++index < children.length) {
    result = children[index].children
      ? changeParent(children[index], matches, end)
      : changeLeaf(children[index], matches, end)
    push.apply(nodes, result.nodes)
    end = result.end
  }

  index = -1

  while (++index < nodes.length) {
    if (nodes[index].type === 'EmoticonNode') {
      if (previous && previous._match === nodes[index]._match) {
        previous.value += nodes[index].value

        if (!generated(previous)) {
          previous.position.end = position.end(nodes[index])
        }
      } else {
        previous = nodes[index]
        merged.push(nodes[index])
      }
    } else {
      previous = null

      if (node.type === 'WordNode') {
        result = {type: node.type, children: [nodes[index]]}

        if (!generated(nodes[index])) {
          result.position = position(nodes[index])
        }

        merged.push(result)
      } else {
        merged.push(nodes[index])
      }
    }
  }

  return {end: end, nodes: merged}
}

function changeLeaf(node, matches, start) {
  var value = toString(node)
  var point = generated(node) ? null : position.start(node)
  var end = start + value.length
  var index = -1
  var textEnd = 0
  var nodes = []
  var emojiEnd
  var child
  var match

  while (++index < matches.length) {
    match = matches[index]
    emojiEnd = match.end - start + 1

    if (match.start - start < value.length && emojiEnd > 0) {
      if (match.start - start > textEnd) {
        child = {
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

      child = {
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
  var start = value.indexOf(':')
  var end = start === -1 ? -1 : value.indexOf(':', start + 1)
  var match

  // Get Gemoji shortcodes.
  while (end !== -1) {
    match = value.slice(start + 1, end)

    if (own.call(gemojiNameToEmoji, match)) {
      matches.push({start: start, end: end})
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

    matches.push({start: start, end: end})
  }

  matches.sort(sort)

  return matches
}

function removeMatch(node) {
  delete node._match
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
