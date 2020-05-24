
const Fs = require('fs')
const Yaml = require('yaml')

const contents = Yaml.parse(Fs.readFileSync('dbsource/schemaProvider.yaml', 'utf8'))

console.log(JSON.stringify(contents))
