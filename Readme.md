# nlcst-emoji-modifier [![Build Status](https://img.shields.io/travis/wooorm/nlcst-emoji-modifier.svg?style=flat)](https://travis-ci.org/wooorm/nlcst-emoji-modifier) [![Coverage Status](https://img.shields.io/coveralls/wooorm/nlcst-emoji-modifier.svg?style=flat)](https://coveralls.io/r/wooorm/nlcst-emoji-modifier?branch=master)

Classify unicode emoji and [Github emoji (gemoji)](https://github.com/wooorm/gemoji) as `EmoticonNode`s.

Implemented by [retext-emoji](https://github.com/wooorm/retext-emoji), but separated for use by standalone (non-[retext](https://github.com/wooorm/retext)) parsers.

> Note: this project is useful in combination with natural language parsers like [parse-latin](https://github.com/wooorm/parse-latin), [parse-dutch](https://github.com/wooorm/parse-dutch), and [parse-english](https://github.com/wooorm/parse-english).

## Installation

npm:
```sh
$ npm install nlcst-emoji-modifier
```

Component.js:
```sh
$ component install wooorm/nlcst-emoji-modifier
```

Bower:
```sh
$ bower install nlcst-emoji-modifier
```

## Usage

```js
var modifier = require('nlcst-emoji-modifier');
var ParseEnglish = require('parse-english');
var english = new ParseEnglish();

/* Attach the modifier. */
modifier(english);

english.parse('Who doesn’t like Gemoji :+1:? You? 💩').children[0].children;
```

Yields:

```json
[
  {
    "type": "SentenceNode",
    "children": [
      {
        "type": "WordNode",
        "children": [
          {
            "type": "TextNode",
            "value": "Who"
          }
        ]
      },
      {
        "type": "WhiteSpaceNode",
        "value": " "
      },
      {
        "type": "WordNode",
        "children": [
          {
            "type": "TextNode",
            "value": "doesn"
          },
          {
            "type": "PunctuationNode",
            "value": "’"
          },
          {
            "type": "TextNode",
            "value": "t"
          }
        ]
      },
      {
        "type": "WhiteSpaceNode",
        "value": " "
      },
      {
        "type": "WordNode",
        "children": [
          {
            "type": "TextNode",
            "value": "like"
          }
        ]
      },
      {
        "type": "WhiteSpaceNode",
        "value": " "
      },
      {
        "type": "WordNode",
        "children": [
          {
            "type": "TextNode",
            "value": "Gemoji"
          }
        ]
      },
      {
        "type": "WhiteSpaceNode",
        "value": " "
      },
      {
        "type": "EmoticonNode",
        "value": ":+1:"
      },
      {
        "type": "PunctuationNode",
        "value": "?"
      }
    ]
  },
  {
    "type": "WhiteSpaceNode",
    "value": " "
  },
  {
    "type": "SentenceNode",
    "children": [
      {
        "type": "WordNode",
        "children": [
          {
            "type": "TextNode",
            "value": "You"
          }
        ]
      },
      {
        "type": "PunctuationNode",
        "value": "?"
      },
      {
        "type": "WhiteSpaceNode",
        "value": " "
      },
      {
        "type": "EmoticonNode",
        "value": "💩"
      }
    ]
  }
]
```

## Performance

On a MacBook Air, **parse-english** performs about 27% slower on content filled with (g)emoji, and a 17% slower on content without (g)emoji, when using this modifier.

```
             parse w/ modifier
  1,299 op/s » A paragraph (5 sentences, 100 words, 5 emoji, 5 gemoji)
  1,647 op/s » A paragraph (5 sentences, 100 words, no emoji, no gemoji)

             parse w/o modifier
  1,775 op/s » A paragraph (5 sentences, 100 words, 5 emoji, 5 gemoji)
  1,974 op/s » A paragraph (5 sentences, 100 words, no emoji, no gemoji)
```

## Related

- [nlcst](https://github.com/wooorm/nlcst)
- [nlcst-emoticon-modifier](https://github.com/wooorm/nlcst-emoticon-modifier)
- [nlcst-affix-emoticon-modifier](https://github.com/wooorm/nlcst-affix-emoticon-modifier)
- [parse-latin](https://github.com/wooorm/parse-latin)
- [parse-dutch](https://github.com/wooorm/parse-dutch)
- [parse-english](https://github.com/wooorm/parse-english)
- [retext](https://github.com/wooorm/retext)
- [textom](https://github.com/wooorm/textom)

## License

MIT © [Titus Wormer](http://wooorm.com)
