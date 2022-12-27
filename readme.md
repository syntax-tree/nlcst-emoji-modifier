# nlcst-emoji-modifier

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[nlcst][] utility to classify emoji and gemoji shortcodes as `EmoticonNode`s.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`emojiModifier(node)`](#emojimodifiernode)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This utility searches for emoji (`👍`) and gemoji shortcodes (`:+1:`) and turns
them into separate nodes.

## When should I use this?

This package is a tiny utility that helps when dealing with emoji and gemoji in
natural language.
The plugin [`retext-emoji`][https://github.com/retextjs/retext-emoji] wraps this utility and others at a
higher-level (easier) abstraction.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, 18.0+), install with [npm][]:

```sh
npm install nlcst-emoji-modifier
```

In Deno with [`esm.sh`][esmsh]:

```js
import {emojiModifier} from "https://esm.sh/nlcst-emoji-modifier@5"
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {emojiModifier} from "https://esm.sh/nlcst-emoji-modifier@5?bundle"
</script>
```

## Use

```js
import {emojiModifier} from 'nlcst-emoji-modifier'
import {inspect} from 'unist-util-inspect'
import {ParseEnglish} from 'parse-english'

const english = new ParseEnglish()
english.useFirst('tokenizeSentence', emojiModifier)

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

This package exports the identifier `emojiModifier`.
There is no default export.

### `emojiModifier(node)`

Classify emoji and gemoji in `node` ([`Sentence`][sentence]) as
`EmoticonNode`s.

## Types

This package is fully typed with [TypeScript][].
It exports no additional types.

It also registers the `Emoticon` node type with `@types/nlcst`.
If you’re working with the syntax tree, make sure to import this utility
somewhere in your types, as that registers the new node types in the tree.

```js
/**
 * @typedef {import('nlcst-emoji-modifier')}
 */

import {visit} from 'unist-util-visit'

/** @type {import('nlcst').Root} */
const tree = getNodeSomeHow()

visit(tree, (node) => {
  // `node` can now be a `Emoticon` node.
})
```

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Related

*   [`nlcst-affix-emoticon-modifier`](https://github.com/syntax-tree/nlcst-affix-emoticon-modifier)
    — merge affix emoticons into the previous sentence in nlcst
*   [`nlcst-emoticon-modifier`](https://github.com/syntax-tree/nlcst-emoticon-modifier)
    — support emoticons

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
ways to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/syntax-tree/nlcst-emoji-modifier/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/nlcst-emoji-modifier/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/nlcst-emoji-modifier.svg

[coverage]: https://codecov.io/github/syntax-tree/nlcst-emoji-modifier

[downloads-badge]: https://img.shields.io/npm/dm/nlcst-emoji-modifier.svg

[downloads]: https://www.npmjs.com/package/nlcst-emoji-modifier

[size-badge]: https://img.shields.io/bundlephobia/minzip/nlcst-emoji-modifier.svg

[size]: https://bundlephobia.com/result?p=nlcst-emoji-modifier

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[license]: license

[author]: https://wooorm.com

[health]: https://github.com/syntax-tree/.github

[contributing]: https://github.com/syntax-tree/.github/blob/main/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/main/support.md

[coc]: https://github.com/syntax-tree/.github/blob/main/code-of-conduct.md

[retext-emoji]: https://github.com/syntax-tree/retext-emoji

[nlcst]: https://github.com/syntax-tree/nlcst

[sentence]: https://github.com/syntax-tree/nlcst#sentence
