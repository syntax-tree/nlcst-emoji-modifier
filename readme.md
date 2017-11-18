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
   └─ SentenceNode[11]
      ├─ WordNode[3]
      │  ├─ TextNode: "It"
      │  ├─ PunctuationNode: "'"
      │  └─ TextNode: "s"
      ├─ WhiteSpaceNode: " "
      ├─ WordNode[1]
      │  └─ TextNode: "raining"
      ├─ WhiteSpaceNode: " "
      ├─ EmoticonNode: ":cat:"
      ├─ WordNode[1]
      │  └─ TextNode: "s"
      ├─ WhiteSpaceNode: " "
      ├─ WordNode[1]
      │  └─ TextNode: "and"
      ├─ WhiteSpaceNode: " "
      ├─ EmoticonNode: ":dog:"
      └─ WordNode[2]
         ├─ TextNode: "s"
         └─ PunctuationNode: "."
```

## API

### `emoji(paragraph)`

Merge emoji and gemoji into a new `EmoticonNode`.

###### Parameters

*   `paragraph` ([`NLCSTParagraphNode`][paragraph]).

## Contribute

See [`contribute.md` in `syntax-tree/nlcst`][contribute] for ways to get
started.

This organisation has a [Code of Conduct][coc].  By interacting with this
repository, organisation, or community you agree to abide by its terms.

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

[paragraph]: https://github.com/syntax-tree/nlcst#paragraph

[contribute]: https://github.com/syntax-tree/nlcst/blob/master/contributing.md

[coc]: https://github.com/syntax-tree/nlcst/blob/master/code-of-conduct.md
