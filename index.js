'use strict'

var toString = require('nlcst-to-string')
var modifier = require('unist-util-modify-children')
var gemoji = require('gemoji')

module.exports = modifier(mergeEmoji)

var own = {}.hasOwnProperty

var EMOTICON_NODE = 'EmoticonNode'

// Magic numbers.

// Gemoji’s are treated by a parser as multiple nodes.
// Because this modifier walks backwards, the first colon never matches a gemoji
// it would normaly walk back to the beginning (the first node).
// However, because the longest gemoji is tokenized as `Punctuation` (`:`),
// `Punctuation` (`+`), `Word` (`1`), and `Punctuation` (`:`), we can safely
// break when the modifier walked back more than 4 times.
var MAX_GEMOJI_PART_COUNT = 12

var shortcodes = []
var unicodes = gemoji.unicode
var byName = gemoji.name
var key

for (key in byName) {
  shortcodes.push(':' + key + ':')
}

// Merge emoji and github-emoji (punctuation marks, symbols, and words) into an
// `EmoticonNode`.
function mergeEmoji(child, index, parent) {
  var siblings = parent.children
  var value = toString(child)
  var siblingIndex
  var node
  var nodes
  var subvalue
  var left
  var right
  var leftMatch
  var rightMatch
  var start
  var pos
  var end
  var replace
  var startIndex
  var nextSibling
  var nextNextSibling
  var possibleEmoji
  var maxSiblingIndex
  var loopIndex
  var lastSibling
  var lastSiblingIndex

  if (child.type === 'WordNode') {
    // 1️⃣ — sometimes a unicode emoji is marked as a word. Mark it as an
    // `EmoticonNode`.
    if (own.call(unicodes, value)) {
      node = {type: EMOTICON_NODE, value: value}

      if (child.position) {
        node.position = child.position
      }

      siblings[index] = node
    } else {
      // ❤️ — Sometimes a unicode emoji is split in two.
      // Remove the last and add its value to the first.
      node = siblings[index - 1]

      if (node && own.call(unicodes, toString(node) + value)) {
        node.type = EMOTICON_NODE
        node.value = toString(node) + value

        if (child.position && node.position) {
          node.position.end = child.position.end
        }

        siblings.splice(index, 1)

        return index
      }
    }
  } else if (own.call(unicodes, value)) {
    child.type = EMOTICON_NODE
    startIndex = index + 1
    nextSibling = siblings[startIndex]
    if (!nextSibling) {
      return
    }

    if (nextSibling.type === 'WordNode') {
      // 🏌 — Normal emoji.
      if (!isVarianceSelector(nextSibling)) {
        return
      }

      possibleEmoji = value + toString(nextSibling)
      maxSiblingIndex = siblings.length
      loopIndex = startIndex + 1

      while (
        loopIndex < maxSiblingIndex &&
        loopIndex - startIndex < 5 &&
        siblings[loopIndex].type !== 'WordNode'
      ) {
        possibleEmoji += toString(siblings[loopIndex])
        loopIndex++
      }

      lastSibling = siblings[loopIndex]

      if (lastSibling && lastSibling.type === 'WordNode') {
        possibleEmoji += toString(lastSibling)
      }

      // 🏌️‍♀️ — Emoji with variance selector.
      if (own.call(unicodes, possibleEmoji)) {
        child.value = possibleEmoji

        if (child.position && lastSibling.position) {
          child.position.end = lastSibling.position.end
        }

        siblings.splice(index + 1, loopIndex - index)

        return index + 1
      }
      // 👨‍❤️‍💋‍👨 — combined emoji.
    } else if (nextSibling.type === 'SymbolNode') {
      possibleEmoji = value + toString(nextSibling)
      maxSiblingIndex = siblings.length
      loopIndex = startIndex + 1

      while (
        loopIndex < maxSiblingIndex &&
        loopIndex - startIndex < 5 &&
        (siblings[loopIndex].type === 'SymbolNode' ||
          (siblings[loopIndex].type === 'WordNode' &&
            isVarianceSelector(siblings[loopIndex])))
      ) {
        possibleEmoji += toString(siblings[loopIndex])
        loopIndex++
      }

      if (own.call(unicodes, possibleEmoji)) {
        child.value = possibleEmoji
        lastSiblingIndex = loopIndex - 1
        lastSibling = siblings[lastSiblingIndex]

        if (child.position && lastSibling.position) {
          child.position.end = lastSibling.position.end
        }

        siblings.splice(index + 1, lastSiblingIndex - index)

        return index + 1
      }
    }
    // 🤽‍♀ — Combined emoji starting in a symbol.
  } else if (child.type === 'SymbolNode') {
    nextSibling = siblings[index + 1]
    nextNextSibling = siblings[index + 2]
    if (!nextSibling || !nextNextSibling) {
      return
    }

    if (
      (nextSibling.type === 'SymbolNode' || nextSibling.type === 'WordNode') &&
      nextNextSibling &&
      nextNextSibling.type === 'SymbolNode'
    ) {
      possibleEmoji = value + toString(nextSibling) + toString(nextNextSibling)

      if (own.call(unicodes, possibleEmoji)) {
        child.type = EMOTICON_NODE
        child.value = possibleEmoji

        if (child.position && nextNextSibling.position) {
          child.position.end = nextNextSibling.position.end
        }

        siblings.splice(index + 1, 2)

        return index + 1
      }
    }
    // :+1: — Gemoji shortcodes.
  } else if (value.charAt(0) === ':') {
    nodes = []
    siblingIndex = index
    subvalue = value
    left = null
    right = null
    leftMatch = null
    rightMatch = null

    if (subvalue.length === 1) {
      rightMatch = child
    } else {
      end = child.position && child.position.end
      start = end && child.position.start
      pos = end && {
        line: start.line,
        column: start.column + 1,
        offset: start.offset + 1
      }

      rightMatch = {
        type: 'PunctuationNode',
        value: ':'
      }

      right = {
        type: 'PunctuationNode',
        value: subvalue.slice(1)
      }

      if (end) {
        rightMatch.position = {start: start, end: pos}
        right.position = {start: pos, end: end}
      }
    }

    while (siblingIndex--) {
      if (index - siblingIndex > MAX_GEMOJI_PART_COUNT) {
        return
      }

      node = siblings[siblingIndex]

      subvalue = toString(node)

      if (subvalue.charAt(subvalue.length - 1) === ':') {
        leftMatch = node
        break
      }

      if (node.children) {
        nodes = nodes.concat(node.children.concat().reverse())
      } else {
        nodes.push(node)
      }

      if (siblingIndex === 0) {
        return
      }
    }

    if (!leftMatch) {
      return
    }

    subvalue = toString(leftMatch)

    if (subvalue.length !== 1) {
      end = leftMatch.position && leftMatch.position.end
      start = end && leftMatch.position.start
      pos = end && {
        line: end.line,
        column: end.column - 1,
        offset: end.offset - 1
      }

      left = {
        type: 'PunctuationNode',
        value: subvalue.slice(0, -1)
      }

      leftMatch = {
        type: 'PunctuationNode',
        value: ':'
      }

      if (end) {
        left.position = {start: start, end: pos}
        leftMatch.position = {start: pos, end: end}
      }
    }

    nodes.push(leftMatch)
    nodes.reverse().push(rightMatch)

    value = toString(nodes)

    if (shortcodes.indexOf(value) === -1) {
      return
    }

    replace = [siblingIndex, index - siblingIndex + 1]

    if (left) {
      replace.push(left)
    }

    child.type = EMOTICON_NODE
    child.value = value

    if (child.position && leftMatch.position) {
      child.position.start = leftMatch.position.start
    }

    if (child.position && rightMatch.position) {
      child.position.end = rightMatch.position.end
    }

    replace.push(child)

    if (right) {
      replace.push(right)
    }

    ;[].splice.apply(siblings, replace)

    return siblingIndex + 3
  }
}

function isVarianceSelector(node) {
  var code = toString(node).charCodeAt(0)
  return code > 65023 && code < 65040
}
