var fs = require('fs');
var Handlebars = require('handlebars');

var exampleDir = __dirname + '/examples';
var template = Handlebars.compile('<html><body><ul>' +
    '{{#each examples}}<li><a href="{{ . }}">{{ . }}</a></li>{{/each}}' +
    '</ul></body></html>');

fs.readdir(exampleDir, function(err, files) {
    var absLinks = files
        .filter(name => name.match('\.html$'))
        .map(name => 'examples/' + name);
    var index = template({ examples: absLinks });
    fs.writeFileSync(__dirname + '/index.html', index)
});
