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

set code-generation/1 touchpoint/3
set touchpoint/3 function-name == colName
set touchpoint/3 query == \${col} name/*
set touchpoint/3 expectOne
set touchpoint/3 output tagValue/name
set touchpoint/3 input/2

set code-generation/1 touchpoint/4
set touchpoint/4 function-name == getCellValue
set touchpoint/4 query == \${row} \${col}
set touchpoint/4 expectOne
set touchpoint/4 output value
set touchpoint/4 output optional
set touchpoint/4 input/2
set touchpoint/4 input/3

set input/2 name/col
set input/2 type/string

set input/3 name/row
set input/3 type/string

set code-generation/2
set code-generation/2 destination-filename == src/GraphSource.ts
set code-generation/2 strategy/text-as-code
set code-generation/2 from-file == src/source.graph

set spreadsheet/1

set spreadsheet/1 col/1
set spreadsheet/1 col/2
set spreadsheet/1 col/3
set spreadsheet/1 row/1
set spreadsheet/1 row/2

set col/1 name/CustomerName
set col/2 name/CustomerEmail
set col/3 name/Status

set row/1 col/1 == Bob
set row/1 col/2 == bob@email.com
set row/1 col/3 == Active

set row/2 col/1 == Karen
set row/2 col/2 == karen@email.com
set row/2 col/3 == Inactive

set code-generation/1 touchpoint/5
set touchpoint/5 function-name == spreadsheetForView
set touchpoint/5 query == \${spreadsheetView} spreadsheet/*
set touchpoint/5 expectOne
set touchpoint/5 output tag/spreadsheet
set touchpoint/5 output optional

set touchpoint/5 input/spreadsheetView
set input/spreadsheetView name/spreadsheetView
set input/spreadsheetView type/string

# Spreadsheet View
set spreadsheet-view/1 spreadsheet/1
set spreadsheet-view/1 selection col/1 row/2

set code-generation/1 touchpoint/6
set touchpoint/6 function-name == getSelectedCell
set touchpoint/6 query == \${spreadsheetView} selection col/* row/*
set touchpoint/6 expectOne
set touchpoint/6 input/spreadsheetView
set touchpoint/6 output output-object/1
set touchpoint/6 output optional

set output-object/1 field/col tagValue/col
set output-object/1 field/row tagValue/row
`