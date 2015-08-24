# nlcst-emoji-modifier [![Build Status](https://img.shields.io/travis/wooorm/nlcst-emoji-modifier.svg)](https://travis-ci.org/wooorm/nlcst-emoji-modifier) [![Coverage Status](https://img.shields.io/codecov/c/github/wooorm/nlcst-emoji-modifier.svg)](https://codecov.io/github/wooorm/nlcst-emoji-modifier)

[NLCST](https://github.com/wooorm/nlcst) modifier to classify unicode emoji and
[Github emoji (gemoji) short-codes](https://github.com/wooorm/gemoji) as
`EmoticonNode`s.

Implemented by [retext-emoji](https://github.com/wooorm/retext-emoji), but
separated for use by standalone (non-[retext](https://github.com/wooorm/retext))
processing.

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install nlcst-emoji-modifier
```

**nlcst-emoji-modifier** is also available for [bower](http://bower.io/#install-packages),
[component](https://github.com/componentjs/component), and
[duo](http://duojs.org/#getting-started), and as an AMD, CommonJS, and globals
module, [uncompressed](nlcst-emoji-modifier.js) and [compressed](nlcst-emoji-modifier.min.js).

## Usage

```javascript
var modifier = require('nlcst-emoji-modifier');
var english = require('parse-english');
var sentence = english().parse('Who doesn’t like Gemoji :+1:? You? 💩').children[0].children[0];

modifyEmoji(sentence);

console.log(sentence);
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

## API

### emojiModifier(sentence)

Classify unicode emoji and [Github emoji (gemoji) short-codes](https://github.com/wooorm/gemoji)
as `EmoticonNode`s.

**Parameters**

*   `sentence` ([`NLCSTSentenceNode`](https://github.com/wooorm/nlcst#sentencenode))
    — Node with children.

**Throws**

*   `Error` — When not given a parent node.

## Related

*   [nlcst](https://github.com/wooorm/nlcst);
*   [nlcst-emoticon-modifier](https://github.com/wooorm/nlcst-emoticon-modifier);
*   [nlcst-affix-emoticon-modifier](https://github.com/wooorm/nlcst-affix-emoticon-modifier);
*   [parse-latin](https://github.com/wooorm/parse-latin);
*   [parse-dutch](https://github.com/wooorm/parse-dutch);
*   [parse-english](https://github.com/wooorm/parse-english);
*   [retext](https://github.com/wooorm/retext).

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)
