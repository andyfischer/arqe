export default `
set code-generation/1
set code-generation/1 destination-filename == src/SpreadsheetViewAPI.ts
set code-generation/1 ik-import == ik
set code-generation/1 strategy/dao-api

set input/1 name/spreadsheet
set input/1 type/string

set code-generation/1 touchpoint/1
set touchpoint/1 function-name == listColumns
set touchpoint/1 query == \${spreadsheet} col/*
set touchpoint/1 output tag/col
set touchpoint/1 input/1

set code-generation/1 touchpoint/2
set touchpoint/2 function-name == listRows
set touchpoint/2 query == \${spreadsheet} row/*
set touchpoint/2 output tag/row
set touchpoint/2 input/1

set code-generation/2
set code-generation/2 destination-filename == src/GraphSource.ts
set code-generation/2 strategy/text-as-code
set code-generation/2 from-file == src/source.graph

set spreadsheet/1
`