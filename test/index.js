/**
 * @author Titus Wormer
 * @copyright 2014-2015 Titus Wormer
 * @license MIT
 * @module nlcst:emoji-modifier
 * @fileoverview Test suite for `nlcst-emoji-modifier`.
 */

'use strict';

/* eslint-env node, mocha */

/*
 * Dependencies.
 */

var assert = require('assert');
var retext = require('retext');
var english = require('parse-english');
var visit = require('unist-util-visit');
var gemoji = require('gemoji');
var emoji = require('..');

/*
 * Fixtures.
 */

var sob = require('./fixtures/sob');
var trololol = require('./fixtures/trololol');
var smith = require('./fixtures/smith');
var cry = require('./fixtures/cry');
var word = require('./fixtures/word');
var wordOnly = require('./fixtures/word-only');
var adjacentEmoji = require('./fixtures/adjacent-emoji');
var adjacentGemoji = require('./fixtures/adjacent-gemoji');
var initialEmoji = require('./fixtures/initial-emoji');
var initialGemoji = require('./fixtures/initial-gemoji');
var inWords = require('./fixtures/in-words');
var baseSentence = 'Lack of cross-device emoji support makes me ';
var fullStop = '.';

/*
 * Methods.
 */

var equal = assert.strictEqual;
var dequal = assert.deepEqual;

/*
 * processor.
 */

var processor = retext(english).use(function () {
    return function (cst) {
        visit(cst, 'SentenceNode', emoji);
    }
});

/**
 * Short-cut to access the CST.
 */
function process(fixture) {
    var cst;

    processor.process(fixture, function (err, file) {
        /* istanbul ignore next */
        if (err) {
            throw err;
        }

        cst = file.namespace('retext').cst;
    });

    return cst;
}

/*
 * Tests.
 */

describe('nlcst-emoji-modifier()', function () {
    it('should throw when not given a parent', function () {
        assert.throws(function () {
            emoji({});
        }, /Missing children in `parent/);
    });

    it('should classify gemoji (`:sob:`)', function () {
        dequal(process('This makes me feel :sob:.'), sob);
    });

    it('should NOT classify invalid gemoji (`:trololol:`)', function () {
        dequal(process('trololol: This makes me feel :trololol:.'), trololol);
    });

    it('should NOT classify invalid gemoji (`L.L. Smith:`)', function () {
        dequal(process('Hello L.L. Smith:\n'), smith);
    });

    it('should classify unicode emoji (`\ud83d\ude2d`)', function () {
        dequal(process('This makes me feel \ud83d\ude2d.'), cry);
    });

    /**
     * Test for by parse-latin incorrectly classified
     * emoji: Some emoji are split over multiple nodes
     * (as they contain letter symbols), such as :v: and
     * :relaxed: (the latter tested below).
     */

    it('should classify emoji with word characters', function () {
        dequal(process('This makes me feel \u263a\ufe0f.'), word);
    });

    /**
     * Test for by parse-latin incorrectly classified
     * emoji: Some emoji are marked as words (as they
     * contain only letter symbols), such as :one: and
     * :i: (the first tested below).
     */

    it('should classify emoji with word only characters', function () {
        dequal(process('This makes me feel \u0031\ufe0f\u20e3.'), wordOnly);
    });

    it('should classify adjacent emoji', function () {
        dequal(process('This makes me feel \ud83d\udc4d \ud83d\udc4e.'), adjacentEmoji);
    });

    it('should classify adjacent gemoji', function () {
        dequal(process('This makes me feel :+1: :-1:.'), adjacentGemoji);
    });

    it('should classify initial emoji', function () {
        dequal(process('\ud83d\udca4 I\'m going to bed.'), initialEmoji);
    });

    it('should classify initial gemoji', function () {
        dequal(process(':zzz: I\'m going to bed.'), initialGemoji);
    });

    it('should classify gemoji in words', function () {
        // console.log(JSON.stringify(process('It\'s raining :cat:s and :dog:s.'), 0, 2));
        dequal(process('It\'s raining :cat:s and :dog:s.'), inWords);
    });
});

Object.keys(gemoji.name).forEach(function (key) {
    var shortcode = ':' + key + ':';
    var emoji = gemoji.name[key].emoji;

    describe(emoji, function () {
        [shortcode, emoji].forEach(function (value) {
            it('should classify `' + value + '`',
                function () {
                    var node = process(baseSentence + value + fullStop);
                    var emoticon = node.children[0].children[0].children[14];

                    equal(emoticon.type, 'EmoticonNode');
                    equal(emoticon.value, value);
                }
            );
        });
    });
});
