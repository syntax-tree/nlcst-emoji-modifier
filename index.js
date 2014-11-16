'use strict';

/**
 * Dependencies.
 */

var emoji,
    nlcstToString;

emoji = require('./data/emoji.json');
nlcstToString = require('nlcst-to-string');

/**
 * Cached methods.
 */

var has;

has = Object.prototype.hasOwnProperty;

/**
 * Constants: node types.
 */

var EMOTICON_NODE;

EMOTICON_NODE = 'EmoticonNode';

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

var MAX_GEMOJI_PART_COUNT;

MAX_GEMOJI_PART_COUNT = 4;

/**
 * Constants for emoji.
 */

var index,
    names,
    shortcodes,
    unicodes,
    unicodeKeys;

names = emoji.names;
unicodeKeys = emoji.unicode;

/**
 * Quick access to short-codes.
 */

unicodes = {};

index = -1;

while (unicodeKeys[++index]) {
    unicodes[unicodeKeys[index]] = true;
}

shortcodes = {};

index = -1;

while (names[++index]) {
    shortcodes[':' + names[index] + ':'] = true;
}

/**
 * Merge emoji and github-emoji (punctuation marks,
 * symbols, and words) into an `EmoticonNode`.
 *
 * @param {CSTNode} child
 * @param {number} index
 * @param {CSTNode} parent
 * @return {undefined|number} - Either void, or the
 *   next index to iterate over.
 */

function mergeEmoji(child, index, parent) {
    var siblings,
        siblingIndex,
        node,
        nodes,
        value;

    siblings = parent.children;

    if (child.type === 'WordNode') {
        value = nlcstToString(child);

        /**
         * Sometimes a unicode emoji is marked as a
         * word. Mark it as an `EmoticonNode`.
         */

        if (has.call(unicodes, value)) {
            siblings[index] = {
                'type': EMOTICON_NODE,
                'value': value
            };
        } else {
            /**
             * Sometimes a unicode emoji is split in two.
             * Remove the last and add its value to
             * the first.
             */

            node = siblings[index - 1];

            if (
                node &&
                has.call(unicodes, nlcstToString(node) + value)
            ) {
                node.type = EMOTICON_NODE;
                node.value = nlcstToString(node) + value;

                siblings.splice(index, 1);

                return index;
            }
        }
    } else if (has.call(unicodes, nlcstToString(child))) {
        child.type = EMOTICON_NODE;
    } else if (nlcstToString(child) === ':') {
        nodes = [];
        siblingIndex = index;

        while (siblingIndex--) {
            if ((index - siblingIndex) >= MAX_GEMOJI_PART_COUNT) {
                return;
            }

            node = siblings[siblingIndex];

            if (node.children) {
                nodes = nodes.concat(node.children.concat().reverse());
            } else {
                nodes.push(node);
            }

            if (nlcstToString(node) === ':') {
                break;
            }

            if (siblingIndex === 0) {
                return;
            }
        }

        nodes.reverse().push(child);

        value = nlcstToString({
            'children': nodes
        });

        if (!has.call(shortcodes, value)) {
            return;
        }

        siblings.splice(siblingIndex, index - siblingIndex);

        child.type = EMOTICON_NODE;
        child.value = value;

        return siblingIndex + 1;
    }
}

/**
 * Move emoticons following a terminal marker (thus in
 * the next sentence) to the previous sentence.
 *
 * @param {NLCSTNode} child
 * @param {number} index
 * @param {NLCSTParagraphNode} parent
 * @return {undefined|number}
 */

function mergeAffixEmoji(child, index, parent) {
    var children,
        prev,
        position,
        node;

    children = child.children;

    if (
        children &&
        children.length &&
        index !== 0
    ) {
        position = -1;

        while (children[++position]) {
            node = children[position];

            if (node.type === EMOTICON_NODE) {
                prev = parent.children[index - 1];

                prev.children = prev.children.concat(
                    children.slice(0, position + 1)
                );

                child.children = children.slice(position + 1);

                /**
                 * Next, iterate over the node again.
                 */

                return index;
            } else if (node.type !== 'WhiteSpaceNode') {
                break;
            }
        }
    }
}

var emojiModifier,
    affixEmojiModifier;

function attach(parser) {
    var paragraphPlugins;

    if (!parser || !parser.parse) {
        throw new Error(
            '`parser` is not a valid parser for ' +
            '`attach(parser)`. Make sure something ' +
            'like `parse-latin` is passed.'
        );
    }

    /**
     * Make sure to not re-attach the modifiers.
     */

    if (!emojiModifier) {
        emojiModifier = parser.constructor.modifier(mergeEmoji);
        affixEmojiModifier = parser.constructor.modifier(mergeAffixEmoji);
    }

    parser.use('tokenizeSentence', emojiModifier);

    /**
     * Adding the paragraph modifier is a bit non-standard.
     * Reasoning is first of all, to not worry about white
     * space nodes between sentences: at this stage,
     * paragraph only consists of `SentenceNode`s.
     * Additionally, adding it before all other modifiers
     * makes sure that sentences starting with a lower case
     * letter still get matched correctly:
     *
     *     Alfred! :+1: bertrand
     *
     * ...is correctly classified as one sentence, and:
     *
     *     Alfred! :+1: Bertrand
     *
     * ...is correctly classified as `SentenceNode`
     * (`Alfred! :+1:`), `WhiteSpaceNode` and
     * `SentenceNode` (`Bertrand`).
     */

    paragraphPlugins = parser.tokenizeParagraphPlugins;

    if (paragraphPlugins.indexOf(affixEmojiModifier) === -1) {
        parser.tokenizeParagraphPlugins.unshift(affixEmojiModifier);
    }
}

/**
 * Expose `attach`.
 */

module.exports = attach;
