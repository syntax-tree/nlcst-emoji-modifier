# nlcst-emoji-modifier [![Build Status][travis-badge]][travis] [![Coverage Status][codecov-badge]][codecov]

Classify unicode emoji and Gemoji shortcodes as `EmoticonNode`s.

Implemented by [**retext-emoji**][retext-emoji], but separated for use by
standalone (non-retext) processing.

## Installation

[npm][]:

```bash
npm install nlcst-emoji-modifier
```

## Usage

```javascript
var modifier = require('nlcst-emoji-modifier');
var inspect = require('unist-util-inspect');
var english = require('parse-english')();

english.useFirst('tokenizeSentence', modifier);

console.log(inspect(english.parse('It\'s raining :cat:s and :dog:s.')));
```

Yields:

```text
RootNode[1]
└─ ParagraphNode[1]
   └─ SentenceNode[10]
      ├─ WordNode[1]
      │  └─ TextNode: 'Who'
      ├─ WhiteSpaceNode: ' '
      ├─ WordNode[3]
      │  ├─ TextNode: 'doesn'
      │  ├─ PunctuationNode: '’'
      │  └─ TextNode: 't'
      ├─ WhiteSpaceNode: ' '
      ├─ WordNode[1]
      │  └─ TextNode: 'like'
      ├─ WhiteSpaceNode: ' '
      ├─ WordNode[1]
      │  └─ TextNode: 'Gemoji'
      ├─ WhiteSpaceNode: ' '
      ├─ EmoticonNode: ':+1:'
      └─ PunctuationNode: '?'
```

## API

### `emoji(sentence)`

Merge affix emoticons into the previous sentence.

###### Parameters

*   `paragraph` ([`NLCSTSentenceNode`][sentence]).

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[travis-badge]: https://img.shields.io/travis/syntax-tree/nlcst-emoji-modifier.svg

[travis]: https://travis-ci.org/syntax-tree/nlcst-emoji-modifier

[codecov-badge]: https://img.shields.io/codecov/c/github/syntax-tree/nlcst-emoji-modifier.svg

[codecov]: https://codecov.io/github/syntax-tree/nlcst-emoji-modifier

[npm]: https://docs.npmjs.com/cli/install

[license]: LICENSE

[author]: http://wooorm.com

[retext-emoji]: https://github.com/wooorm/retext-emoji

[sentence]: https://github.com/syntax-tree/nlcst#paragraph
