/**
 * @author Titus Wormer
 * @copyright 2014-2015 Titus Wormer
 * @license MIT
 * @module nlcst:emoji-modifier
 * @fileoverview Build data.
 */

'uses strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var gemoji = require('gemoji');
var fs = require('fs');

/*
 * Build.
 */

fs.writeFileSync('./data/emoji.json', JSON.stringify({
    'unicode': Object.keys(gemoji.unicode),
    'names': Object.keys(gemoji.name)
}, null, 2) + '\n');
