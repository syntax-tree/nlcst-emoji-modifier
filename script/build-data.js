'uses strict';

var fs = require('fs');
var gemoji = require('gemoji');

fs.writeFileSync('./data/emoji.json', JSON.stringify({
  unicode: Object.keys(gemoji.unicode),
  names: Object.keys(gemoji.name)
}, null, 2) + '\n');
