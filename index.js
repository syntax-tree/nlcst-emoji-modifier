'use strict';

/* Dependencies. */
var toString = require('nlcst-to-string');
var modifier = require('unist-util-modify-children');
var emoji = require('./data/emoji.json');

/* Expose. */
module.exports = modifier(mergeEmoji);

/* Node types. */
var EMOTICON_NODE = 'EmoticonNode';

/* Magic numbers.
 *
 * Gemoji's are treated by a parser as multiple nodes.
 * Because this modifier walks backwards, the first colon
 * never matches a gemoji it would normaly walk back to
 * the beginning (the first node). However, because the
 * longest gemoji is tokenized as `Punctuation` (`:`),
 * `Punctuation` (`+`), `Word` (`1`), and `Punctuation`
 * (`:`), we can safely break when the modifier walked
 * back more than 4 times. */
var MAX_GEMOJI_PART_COUNT = 12;

/* Constants. */
var names = emoji.names;
var unicodeKeys = emoji.unicode;
var shortcodes = {};
var unicodes = {};

/* Quick access to short-codes. */
var index = -1;

while (unicodeKeys[++index]) {
  unicodes[unicodeKeys[index]] = true;
}

index = -1;

while (names[++index]) {
  shortcodes[':' + names[index] + ':'] = true;
}

/* Merge emoji and github-emoji (punctuation marks,
 * symbols, and words) into an `EmoticonNode`. */
function mergeEmoji(child, index, parent) {
  var siblings = parent.children;
  var siblingIndex;
  var node;
  var nodes;
  var value;
  var subvalue;
  var left;
  var right;
  var leftMatch;
  var rightMatch;
  var start;
  var pos;
  var end;
  var replace;

  if (child.type === 'WordNode') {
    value = toString(child);

    /* Sometimes a unicode emoji is marked as a
     * word. Mark it as an `EmoticonNode`. */
    if (unicodes[value] === true) {
      node = {type: EMOTICON_NODE, value: value};

      if (child.position) {
        node.position = child.position;
      }

      siblings[index] = node;
    } else {
      /* Sometimes a unicode emoji is split in two.
       * Remove the last and add its value to
       * the first. */
      node = siblings[index - 1];

      if (node && unicodes[toString(node) + value] === true) {
        node.type = EMOTICON_NODE;
        node.value = toString(node) + value;

        if (child.position && node.position) {
          node.position.end = child.position.end;
        }

        siblings.splice(index, 1);

        return index;
      }
    }
  } else if (unicodes[toString(child)] === true) {
    child.type = EMOTICON_NODE;
  } else if (toString(child).charAt(0) === ':') {
    nodes = [];
    siblingIndex = index;
    subvalue = toString(child);
    left = right = leftMatch = rightMatch = null;

    if (subvalue.length === 1) {
      rightMatch = child;
    } else {
      end = child.position && child.position.end;
      start = end && child.position.start;
      pos = end && {
        line: start.line,
        column: start.column + 1,
        offset: start.offset + 1
      };

      rightMatch = {
        type: 'PunctuationNode',
        value: ':'
      };

      right = {
        type: 'PunctuationNode',
        value: subvalue.slice(1)
      };

      if (end) {
        rightMatch.position = {start: start, end: pos};
        right.position = {start: pos, end: end};
      }
    }

    while (siblingIndex--) {
      if ((index - siblingIndex) > MAX_GEMOJI_PART_COUNT) {
        return;
      }

      node = siblings[siblingIndex];

      subvalue = toString(node);

      if (subvalue.charAt(subvalue.length - 1) === ':') {
        leftMatch = node;
        break;
      }

      if (node.children) {
        nodes = nodes.concat(node.children.concat().reverse());
      } else {
        nodes.push(node);
      }

      if (siblingIndex === 0) {
        return;
      }
    }

    if (!leftMatch) {
      return;
    }

    subvalue = toString(leftMatch);

    if (subvalue.length !== 1) {
      end = leftMatch.position && leftMatch.position.end;
      start = end && leftMatch.position.start;
      pos = end && {
        line: end.line,
        column: end.column - 1,
        offset: end.offset - 1
      };

      left = {
        type: 'PunctuationNode',
        value: subvalue.slice(0, -1)
      };

      leftMatch = {
        type: 'PunctuationNode',
        value: ':'
      };

      if (end) {
        left.position = {start: start, end: pos};
        leftMatch.position = {start: pos, end: end};
      }
    }

    nodes.push(leftMatch);
    nodes.reverse().push(rightMatch);

    value = toString(nodes);

    if (shortcodes[value] !== true) {
      return;
    }

    replace = [
      siblingIndex,
      index - siblingIndex + 1
    ];

    if (left) {
      replace.push(left);
    }

    child.type = EMOTICON_NODE;
    child.value = value;

    if (child.position && leftMatch.position) {
      child.position.start = leftMatch.position.start;
    }

    if (child.position && rightMatch.position) {
      child.position.end = rightMatch.position.end;
    }

    replace.push(child);

    if (right) {
      replace.push(right);
    }

    [].splice.apply(siblings, replace);

    return siblingIndex + 3;
  }
}
