'use strict';

/**
 * Dependencies.
 */

var emojiModifier,
    ParseEnglish,
    gemoji,
    assert;

emojiModifier = require('./');
ParseEnglish = require('parse-english');
gemoji = require('gemoji');
assert = require('assert');

/**
 * `ParseEnglish`.
 */

var parseEnglish;

parseEnglish = new ParseEnglish();

emojiModifier(parseEnglish);

/**
 * Fixtures.
 */

var baseSentence,
    fullStop;

baseSentence = 'Lack of cross-device emoji support makes me ';
fullStop = '.';

/**
 * Tests.
 */

describe('nlcst-emoji-modifier()', function () {
    it('should be a `function`', function () {
        assert(typeof emojiModifier === 'function');
    });

    it('should throw when not given a parser', function () {
        assert.throws(function () {
            emojiModifier({});
        }, /not a valid parser/);

        assert.doesNotThrow(function () {
            emojiModifier(new ParseEnglish());
        });
    });

    it('should classify gemoji (`:sob:`) as an `EmoticonNode`', function () {
        var tree;

        tree = parseEnglish.parse('This makes me feel :sob:.');

        assert(
            JSON.stringify(tree.children[0].children[0].children) ===
            JSON.stringify([
                {
                    'type': 'WordNode',
                    'children': [
                        {
                            'type': 'TextNode',
                            'value': 'This'
                        }
                    ]
                },
                {
                    'type': 'WhiteSpaceNode',
                    'value': ' '
                },
                {
                    'type': 'WordNode',
                    'children': [
                        {
                            'type': 'TextNode',
                            'value': 'makes'
                        }
                    ]
                },
                {
                    'type': 'WhiteSpaceNode',
                    'value': ' '
                },
                {
                    'type': 'WordNode',
                    'children': [
                        {
                            'type': 'TextNode',
                            'value': 'me'
                        }
                    ]
                },
                {
                    'type': 'WhiteSpaceNode',
                    'value': ' '
                },
                {
                    'type': 'WordNode',
                    'children': [
                        {
                            'type': 'TextNode',
                            'value': 'feel'
                        }
                    ]
                },
                {
                    'type': 'WhiteSpaceNode',
                    'value': ' '
                },
                {
                    'type': 'EmoticonNode',
                    'value': ':sob:'
                },
                {
                    'type': 'PunctuationNode',
                    'value': '.'
                }
            ])
        );
    });

    it('should NOT classify invalid gemoji (`:trololol:`) as an ' +
        '`EmoticonNode`',
        function () {
            var tree;

            tree = parseEnglish.parse(
                'trololol: This makes me feel :trololol:.'
            );

            assert(
                JSON.stringify(tree.children[0].children[0].children) ===
                JSON.stringify([
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'trololol'
                            }
                        ]
                    },
                    {
                        'type': 'PunctuationNode',
                        'value': ':'
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'This'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'makes'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'me'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'feel'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'PunctuationNode',
                        'value': ':'
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'trololol'
                            }
                        ]
                    },
                    {
                        'type': 'PunctuationNode',
                        'value': ':'
                    },
                    {
                        'type': 'PunctuationNode',
                        'value': '.'
                    }
                ])
            );
        }
    );

    it('should NOT classify invalid gemoji (`L.L. Smith:`) as an ' +
        '`EmoticonNode`',
        function () {
            var tree;

            tree = parseEnglish.parse('Hello L.L. Smith:\n');

            assert(
                JSON.stringify(tree.children[0].children[0].children) ===
                JSON.stringify([
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'Hello'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'L'
                            },
                            {
                                'type': 'PunctuationNode',
                                'value': '.'
                            },
                            {
                                'type': 'TextNode',
                                'value': 'L'
                            },
                            {
                                'type': 'PunctuationNode',
                                'value': '.'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'Smith'
                            }
                        ]
                    },
                    {
                        'type': 'PunctuationNode',
                        'value': ':'
                    }
                ])
            );
        }
    );

    it('should classify unicode emoji (`\ud83d\ude2d`) as an ' +
        '`EmoticonNode`',
        function () {
            var tree;

            tree = parseEnglish.parse('This makes me feel \ud83d\ude2d.');

            assert(
                JSON.stringify(tree.children[0].children[0].children) ===
                JSON.stringify([
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'This'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'makes'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'me'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'feel'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'EmoticonNode',
                        'value': '\ud83d\ude2d'
                    },
                    {
                        'type': 'PunctuationNode',
                        'value': '.'
                    }
                ])
            );
        }
    );

    /**
     * Test for by parse-latin incorrectly classified
     * emoji: Some emoji are split over multiple nodes
     * (as they contain letter symbols), such as :v: and
     * :relaxed: (the latter tested below).
     */

    it('should classify unicode emoji containing some word characters ' +
        '(such as `\u263a\ufe0f`) as an `EmoticonNode`',
        function () {
            var tree;

            tree = parseEnglish.parse('This makes me feel \u263a\ufe0f.');

            assert(
                JSON.stringify(tree.children[0].children[0].children) ===
                JSON.stringify([
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'This'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'makes'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'me'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'feel'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'EmoticonNode',
                        'value': '\u263a\ufe0f'
                    },
                    {
                        'type': 'PunctuationNode',
                        'value': '.'
                    }
                ])
            );
        }
    );

    /**
     * Test for by parse-latin incorrectly classified
     * emoji: Some emoji are marked as words (as they
     * contain only letter symbols), such as :one: and
     * :i: (the first tested below).
     */

    it('should classify unicode emoji containing only word characters ' +
        '(such as `\u0031\ufe0f\u20e3`) as an `EmoticonNode`',
        function () {
            var tree;

            tree = parseEnglish.parse(
               'This makes me feel \u0031\ufe0f\u20e3.'
            );

            assert(
               JSON.stringify(tree.children[0].children[0].children) ===
               JSON.stringify([
                   {
                       'type': 'WordNode',
                       'children': [
                           {
                               'type': 'TextNode',
                               'value': 'This'
                           }
                       ]
                   },
                   {
                       'type': 'WhiteSpaceNode',
                       'value': ' '
                   },
                   {
                       'type': 'WordNode',
                       'children': [
                           {
                               'type': 'TextNode',
                               'value': 'makes'
                           }
                       ]
                   },
                   {
                       'type': 'WhiteSpaceNode',
                       'value': ' '
                   },
                   {
                       'type': 'WordNode',
                       'children': [
                           {
                               'type': 'TextNode',
                               'value': 'me'
                           }
                       ]
                   },
                   {
                       'type': 'WhiteSpaceNode',
                       'value': ' '
                   },
                   {
                       'type': 'WordNode',
                       'children': [
                           {
                               'type': 'TextNode',
                               'value': 'feel'
                           }
                       ]
                   },
                   {
                       'type': 'WhiteSpaceNode',
                       'value': ' '
                   },
                   {
                       'type': 'EmoticonNode',
                       'value': '\u0031\ufe0f\u20e3'
                   },
                   {
                       'type': 'PunctuationNode',
                       'value': '.'
                   }
               ])
            );
        }
    );

    it('should classify two adjacent unicode emoji ' +
        '(`\ud83d\udc4d \ud83d\udc4e`) as two `EmoticonNode`s',
        function () {
            var tree;

            tree = parseEnglish.parse(
                'This makes me feel \ud83d\udc4d \ud83d\udc4e.'
            );

            assert(
                JSON.stringify(tree.children[0].children[0].children) ===
                JSON.stringify([
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'This'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'makes'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'me'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'feel'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'EmoticonNode',
                        'value': '\ud83d\udc4d'
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'EmoticonNode',
                        'value': '\ud83d\udc4e'
                    },
                    {
                        'type': 'PunctuationNode',
                        'value': '.'
                    }
                ])
            );
        }
    );

    it('should classify unicode emoji at sentence start as an `EmoticonNode`',
        function () {
            var tree;

            tree = parseEnglish.parse('\ud83d\udca4 I\'m going to bed.');

            assert(
                JSON.stringify(tree.children[0].children[0].children) ===
                JSON.stringify([
                    {
                        'type': 'EmoticonNode',
                        'value': '\ud83d\udca4'
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'I'
                            },
                            {
                                'type': 'PunctuationNode',
                                'value': '\''
                            },
                            {
                                'type': 'TextNode',
                                'value': 'm'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'going'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'to'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'bed'
                            }
                        ]
                    },
                    {
                        'type': 'PunctuationNode',
                        'value': '.'
                    }
                ])
            );
        }
    );

    it('should classify gemoji at sentence start as an `EmoticonNode`',
        function () {
            var tree;

            tree = parseEnglish.parse(':zzz: I\'m going to bed.');

            assert(
                JSON.stringify(tree.children[0].children[0].children) ===
                JSON.stringify([
                    {
                        'type': 'EmoticonNode',
                        'value': ':zzz:'
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'I'
                            },
                            {
                                'type': 'PunctuationNode',
                                'value': '\''
                            },
                            {
                                'type': 'TextNode',
                                'value': 'm'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'going'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'to'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'bed'
                            }
                        ]
                    },
                    {
                        'type': 'PunctuationNode',
                        'value': '.'
                    }
                ])
            );
        }
    );

    it('should classify two adjacent gemoji ' +
        '(`:+1: :-1:`) as two `EmoticonNode`s',
        function () {
            var tree;

            tree = parseEnglish.parse(
                'This makes me feel :+1: :-1:.'
            );

            assert(
                JSON.stringify(tree.children[0].children[0].children) ===
                JSON.stringify([
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'This'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'makes'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'me'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'WordNode',
                        'children': [
                            {
                                'type': 'TextNode',
                                'value': 'feel'
                            }
                        ]
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'EmoticonNode',
                        'value': ':+1:'
                    },
                    {
                        'type': 'WhiteSpaceNode',
                        'value': ' '
                    },
                    {
                        'type': 'EmoticonNode',
                        'value': ':-1:'
                    },
                    {
                        'type': 'PunctuationNode',
                        'value': '.'
                    }
                ])
            );
        }
    );

    it('should classify gemoji in words', function () {
        var tree;

        tree = parseEnglish.parse(
            'It\'s raining :cat:s and :dog:s.'
        );

        assert(
            JSON.stringify(tree.children[0].children[0].children) ===
            JSON.stringify([
                {
                    'type': 'WordNode',
                    'children': [
                        {
                            'type': 'TextNode',
                            'value': 'It'
                        },
                        {
                            'type': 'PunctuationNode',
                            'value': '\''
                        },
                        {
                            'type': 'TextNode',
                            'value': 's'
                        }
                    ]
                },
                {
                    'type': 'WhiteSpaceNode',
                    'value': ' '
                },
                {
                    'type': 'WordNode',
                    'children': [
                        {
                            'type': 'TextNode',
                            'value': 'raining'
                        }
                    ]
                },
                {
                    'type': 'WhiteSpaceNode',
                    'value': ' '
                },
                {
                    'type': 'EmoticonNode',
                    'value': ':cat:'
                },
                {
                    'type': 'WordNode',
                    'children': [
                        {
                            'type': 'TextNode',
                            'value': 's'
                        }
                    ]
                },
                {
                    'type': 'WhiteSpaceNode',
                    'value': ' '
                },
                {
                    'type': 'WordNode',
                    'children': [
                        {
                            'type': 'TextNode',
                            'value': 'and'
                        }
                    ]
                },
                {
                    'type': 'WhiteSpaceNode',
                    'value': ' '
                },
                {
                    'type': 'EmoticonNode',
                    'value': ':dog:'
                },
                {
                    'type': 'WordNode',
                    'children': [
                        {
                            'type': 'TextNode',
                            'value': 's'
                        }
                    ]
                },
                {
                    'type': 'PunctuationNode',
                    'value': '.'
                }
            ])
        );
    });
});

function describeEmoji(key, information) {
    var shortcode,
        emoji;

    shortcode = ':' + key + ':';
    emoji = information.emoji;

    describe(emoji, function () {
        it('should classify `' + emoji + '` as an `EmoticonNode`',
            function () {
                var tree,
                    emoticon;

                tree = parseEnglish.parse(
                    baseSentence + emoji + fullStop
                );

                emoticon = tree.children[0].children[0].children[14];

                assert(emoticon.type === 'EmoticonNode');
                assert(emoticon.value === emoji);
            }
        );

        it('should classify `' + shortcode + '` as an `EmoticonNode`',
            function () {
                var tree,
                    emoticon;

                tree = parseEnglish.parse(
                    baseSentence + shortcode + fullStop
                );

                emoticon = tree.children[0].children[0].children[14];

                assert(emoticon.type === 'EmoticonNode');
                assert(emoticon.value === shortcode);
            }
        );
    });
}

Object.keys(gemoji.name).forEach(function (key) {
    describeEmoji(key, gemoji.name[key]);
});
