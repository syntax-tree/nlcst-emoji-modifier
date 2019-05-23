# nlcst-emoji-modifier

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**nlcst**][nlcst] utility to classify emoji and gemoji shortcodes as
`EmoticonNode`s.

> **Note**: You probably want to use [retext-emoji][].

## Install

[npm][]:

```bash
npm install nlcst-emoji-modifier
```

## Usage

```javascript
var modifier = require('nlcst-emoji-modifier')
var inspect = require('unist-util-inspect')
var english = require('parse-english')()

english.useFirst('tokenizeSentence', modifier)

console.log(inspect(english.parse('It’s raining :cat:s and :dog:s.')))
```

Yields:

```text
RootNode[1]
└─ ParagraphNode[1]
   └─ SentenceNode[11]
      ├─ WordNode[3]
      │  ├─ TextNode: "It"
      │  ├─ PunctuationNode: "’"
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

*   `paragraph` ([`ParagraphNode`][paragraph]).

## Contribute

See [`contributing.md` in `syntax-tree/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [Code of Conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/syntax-tree/nlcst-emoji-modifier.svg

[build]: https://travis-ci.org/syntax-tree/nlcst-emoji-modifier

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/nlcst-emoji-modifier.svg

[coverage]: https://codecov.io/github/syntax-tree/nlcst-emoji-modifier

[downloads-badge]: https://img.shields.io/npm/dm/nlcst-emoji-modifier.svg

[downloads]: https://www.npmjs.com/package/nlcst-emoji-modifier

[size-badge]: https://img.shields.io/bundlephobia/minzip/nlcst-emoji-modifier.svg

[size]: https://bundlephobia.com/result?p=nlcst-emoji-modifier

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/join%20the%20community-on%20spectrum-7b16ff.svg

[chat]: https://spectrum.chat/unified/syntax-tree

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/syntax-tree/.github/blob/master/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/master/support.md

[coc]: https://github.com/syntax-tree/.github/blob/master/code-of-conduct.md

[retext-emoji]: https://github.com/syntax-tree/retext-emoji

[nlcst]: https://github.com/syntax-tree/nlcst

[paragraph]: https://github.com/syntax-tree/nlcst#paragraph
