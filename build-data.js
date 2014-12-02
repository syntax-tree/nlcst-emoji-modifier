'uses strict';

var gemoji,
    fs;

gemoji = require('gemoji');
fs = require('fs');

fs.writeFileSync('./data/emoji.json', JSON.stringify({
    'unicode': Object.keys(gemoji.unicode),
    'names': Object.keys(gemoji.name)
}, null, 2));
