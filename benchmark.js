'use strict';

/**
 * Dependencies.
 */

var modifier,
    ParseEnglish,
    gemoji;

modifier = require('./');
ParseEnglish = require('parse-english');
gemoji = require('gemoji');

/**
 * `ParseEnglish`.
 */

var parseEnglish,
    emojiParseEnglish;

parseEnglish = new ParseEnglish();
emojiParseEnglish = new ParseEnglish();

modifier(emojiParseEnglish);

/**
 * Fixtures.
 *
 * Source:
 *   http://www.gutenberg.org/cache/epub/11024/pg11024.html
 */

var paragraph,
    emojiParagraph;

/**
 * A paragraph, 5 sentences, filled with emoji.
 */

emojiParagraph = 'Thou art a churlish knight to so ' +
    'affront a :woman: he could not sit upon his ' +
    gemoji.name.horse + ' any longer. ' +

    'For methinks something hath befallen my :man: ' +
    'and that he then, after a while, he ' +
    gemoji.name.cry + ' out in great voice. ' +

    'For that ' + gemoji.name.sunny + ' in the sky ' +
    'lieth in the south then Queen Helen fell down in ' +
    'a swoon, and :sleeping:. ' +

    'Touch me not, for I am not mortal, but ' +
    gemoji.name.angel + 'so the Lady of the Lake ' +
    ':zap: away, everything behind. ' +

    'Where :princess: had stood was clear, ' +
    'and she was gone since ' + gemoji.name.man + ' ' +
    'does not choose to assume my quarrel.';

/**
 * A paragraph, 5 sentences, without emoji.
 */

paragraph = 'Thou art a churlish knight to so affront ' +
    'a lady he could not sit upon his horse any ' +
    'longer. ' +

    'For methinks something hath befallen my lord ' +
    'and that he then, after a while, he cried out ' +
    'in great voice. ' +

    'For that light in the sky lieth in the south ' +
    'then Queen Helen fell down in a swoon, and ' +
    'lay. ' +

    'Touch me not, for I am not mortal, but Fay ' +
    'so the Lady of the Lake vanished away, ' +
    'everything behind. ' +

    'Where she had stood was clear, and she was ' +
    'gone since Sir Kay does not choose to assume my ' +
    'quarrel.';
/**
 * Benchmarks.
 */

suite('parse w/ modifier', function () {
    bench('A paragraph (5 sentences, 100 words, 5 emoji, 5 gemoji)',
        function () {
            emojiParseEnglish.parse(emojiParagraph);
        }
    );

    bench('A paragraph (5 sentences, 100 words, no emoji, no gemoji)',
        function () {
            emojiParseEnglish.parse(paragraph);
        }
    );
});

suite('parse w/o modifier', function () {
    bench('A paragraph (5 sentences, 100 words, 5 emoji, 5 gemoji)',
        function () {
            parseEnglish.parse(emojiParagraph);
        }
    );

    bench('A paragraph (5 sentences, 100 words, no emoji, no gemoji)',
        function () {
            parseEnglish.parse(paragraph);
        }
    );
});
