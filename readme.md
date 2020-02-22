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

> **Note**: You probably want to use [`retext-emoji`][retext-emoji].

## Install

[npm][]:

```sh
npm install nlcst-emoji-modifier
```

## Use

```js
var modifier = require('nlcst-emoji-modifier')
var inspect = require('unist-util-inspect')
var english = require('parse-english')()

english.useFirst('tokenizeSentence', modifier)

console.log(inspect(english.parse('It’s raining :cat:s and :dog:s.')))
```

Yields:

```txt
RootNode[1] (1:1-1:32, 0-31)
└─ ParagraphNode[1] (1:1-1:32, 0-31)
   └─ SentenceNode[11] (1:1-1:32, 0-31)
      ├─ WordNode[3] (1:1-1:5, 0-4)
      │  ├─ TextNode: "It" (1:1-1:3, 0-2)
      │  ├─ PunctuationNode: "’" (1:3-1:4, 2-3)
      │  └─ TextNode: "s" (1:4-1:5, 3-4)
      ├─ WhiteSpaceNode: " " (1:5-1:6, 4-5)
      ├─ WordNode[1] (1:6-1:13, 5-12)
      │  └─ TextNode: "raining" (1:6-1:13, 5-12)
      ├─ WhiteSpaceNode: " " (1:13-1:14, 12-13)
      ├─ EmoticonNode: ":cat:" (1:14-1:19, 13-18)
      ├─ WordNode[1] (1:19-1:20, 18-19)
      │  └─ TextNode: "s" (1:19-1:20, 18-19)
      ├─ WhiteSpaceNode: " " (1:20-1:21, 19-20)
      ├─ WordNode[1] (1:21-1:24, 20-23)
      │  └─ TextNode: "and" (1:21-1:24, 20-23)
      ├─ WhiteSpaceNode: " " (1:24-1:25, 23-24)
      ├─ EmoticonNode: ":dog:" (1:25-1:30, 24-29)
      └─ WordNode[2] (1:30-1:32, 29-31)
         ├─ TextNode: "s" (1:30-1:31, 29-30)
         └─ PunctuationNode: "." (1:31-1:32, 30-31)
```

## API

### `emoji(node)`

Merge emoji and gemoji into a new `EmoticonNode`.

###### Parameters

*   `node` ([`SentenceNode`][sentence]).

## Related

*   [`nlcst-affix-emoticon-modifier`](https://github.com/syntax-tree/nlcst-affix-emoticon-modifier)
    — Merge affix emoticons into the previous sentence in nlcst
*   [`nlcst-emoticon-modifier`](https://github.com/syntax-tree/nlcst-emoticon-modifier)
    — Support emoticons

## Contribute

See [`contributing.md` in `syntax-tree/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
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

[chat-badge]: https://img.shields.io/badge/chat-spectrum-7b16ff.svg

[chat]: https://spectrum.chat/unified/syntax-tree

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/syntax-tree/.github/blob/master/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/master/support.md

[coc]: https://github.com/syntax-tree/.github/blob/master/code-of-conduct.md

[retext-emoji]: https://github.com/syntax-tree/retext-emoji

[nlcst]: https://github.com/syntax-tree/nlcst

[sentence]: https://github.com/syntax-tree/nlcst#sentence
