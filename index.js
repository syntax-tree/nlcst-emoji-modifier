/**
 * @author Titus Wormer
 * @copyright 2014-2015 Titus Wormer
 * @license MIT
 * @module nlcst:emoji-modifier
 * @fileoverview Emoji in NLCST.
 */

'use strict';

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var toString = require('nlcst-to-string');
var modifier = require('unist-util-modify-children');
var emoji = require('./data/emoji.json');

/*
 * Constants: node types.
 */

var EMOTICON_NODE = 'EmoticonNode';

/**
 * Constants: magic numbers.
 *
 * Gemoji's are treated by a parser as multiple nodes.
 * Because this modifier walks backwards, the first colon
 * never matches a gemoji it would normaly walk back to
 * the beginning (the first node). However, because the
 * longest gemoji is tokenized as `Punctuation` (`:`),
 * `Punctuation` (`+`), `Word` (`1`), and `Punctuation`
 * (`:`), we can safely break when the modifier walked
 * back more than 4 times.
 */

var MAX_GEMOJI_PART_COUNT = 12;

/**
 * Constants for emoji.
 */

var names = emoji.names;
var unicodeKeys = emoji.unicode;
var shortcodes = {};
var unicodes = {};
var index;

/*
 * Quick access to short-codes.
 */

index = -1;

while (unicodeKeys[++index]) {
    unicodes[unicodeKeys[index]] = true;
}

index = -1;

while (names[++index]) {
    shortcodes[':' + names[index] + ':'] = true;
}

/**
 * Merge emoji and github-emoji (punctuation marks,
 * symbols, and words) into an `EmoticonNode`.
 *
 * @param {CSTNode} child - Node to check.
 * @param {number} index - Position of `child` in `parent`.
 * @param {CSTNode} parent - Parent of `node`.
 * @return {number?} - Either void, or the next index to
 *   iterate over.
 */
function mergeEmoji(child, index, parent) {
    var siblings = parent.children;
    var siblingIndex;
    var node;
    var nodes;
    var value;

    if (child.type === 'WordNode') {
        value = toString(child);

        /*
         * Sometimes a unicode emoji is marked as a
         * word. Mark it as an `EmoticonNode`.
         */

        if (unicodes[value] === true) {
            siblings[index] = {
                'type': EMOTICON_NODE,
                'value': value
            };
        } else {
            /*
             * Sometimes a unicode emoji is split in two.
             * Remove the last and add its value to
             * the first.
             */

            node = siblings[index - 1];

            if (node && unicodes[toString(node) + value] === true) {
                node.type = EMOTICON_NODE;
                node.value = toString(node) + value;

                siblings.splice(index, 1);

                return index;
            }
        }
    } else if (unicodes[toString(child)] === true) {
        child.type = EMOTICON_NODE;
    } else if (toString(child) === ':') {
        nodes = [];
        siblingIndex = index;

        while (siblingIndex--) {
            if ((index - siblingIndex) > MAX_GEMOJI_PART_COUNT) {
                return;
            }

            node = siblings[siblingIndex];

            if (node.children) {
                nodes = nodes.concat(node.children.concat().reverse());
            } else {
                nodes.push(node);
            }

            if (toString(node) === ':') {
                break;
            }

            if (siblingIndex === 0) {
                return;
            }
        }

        nodes.reverse().push(child);

        value = toString(nodes);

        if (shortcodes[value] !== true) {
            return;
        }

        siblings.splice(siblingIndex, index - siblingIndex);

        child.type = EMOTICON_NODE;
        child.value = value;

        return siblingIndex + 1;
    }
}

/*
 * Expose.
 */

module.exports = modifier(mergeEmoji);
