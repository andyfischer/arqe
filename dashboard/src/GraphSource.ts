export default `
set code-generation/spreadsheet-view
set code-generation/spreadsheet-view destination-filename == src/SpreadsheetViewAPI.ts
set code-generation/spreadsheet-view ik-import == ik
set code-generation/spreadsheet-view strategy/dao-api
# set code-generation/spreadsheet-view verbose-logging

set input/1 name/spreadsheet
set input/1 type/string

set code-generation/spreadsheet-view touchpoint/1
set touchpoint/1 function-name == listColumns
set touchpoint/1 query == \${spreadsheet} col/*
set touchpoint/1 output tag/col
set touchpoint/1 input/1

set code-generation/spreadsheet-view touchpoint/2
set touchpoint/2 function-name == listRows
set touchpoint/2 query == \${spreadsheet} row/*
set touchpoint/2 output tag/row
set touchpoint/2 input/1

set code-generation/spreadsheet-view touchpoint/3
set touchpoint/3 function-name == colName
set touchpoint/3 query == \${col} name/*
set touchpoint/3 expectOne
set touchpoint/3 output tagValue/name
set touchpoint/3 input/2

set code-generation/spreadsheet-view touchpoint/4
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

set code-generation/spreadsheet-view touchpoint/5
set touchpoint/5 function-name == spreadsheetForView
set touchpoint/5 query == \${spreadsheetView} spreadsheet/*
set touchpoint/5 expectOne
set touchpoint/5 output tag/spreadsheet
set touchpoint/5 output optional

set touchpoint/5 input/spreadsheetView
set input/spreadsheetView name/spreadsheetView
set input/spreadsheetView type/string

set code-generation/spreadsheet-view touchpoint/6
set touchpoint/6 function-name == getSelectedCell
set touchpoint/6 query == \${spreadsheetView} selection col/* row/*
set touchpoint/6 expectOne
set touchpoint/6 input/spreadsheetView
set touchpoint/6 output output-object/1
set touchpoint/6 output optional

set output-object/1 field/col tag/col
set output-object/1 field/row tag/row

set code-generation/edit-model touchpoint/7
set touchpoint/7 function-name == findKeyForBrowserName
set touchpoint/7 query == key/* browsername/\${browserName}
set touchpoint/7 expectOne
set touchpoint/7 output optional
set touchpoint/7 input/browserName
set touchpoint/7 output tag/key

set input/browserName type/string
set input/browserName name/browserName

set code-generation/edit-model touchpoint/8
set touchpoint/8 function-name == findActionForKey
set touchpoint/8 query == \${key} action/*
set touchpoint/8 expectOne
set touchpoint/8 output optional
set touchpoint/8 input/key
set touchpoint/8 output tag/action

set input/key type/string
set input/key name/key

# Spreadsheet View
set spreadsheet-view/1 spreadsheet/1
set spreadsheet-view/1 selection col/1 row/2

set code-generation/edit-model
set code-generation/edit-model destination-filename == src/EditModelAPI.ts
set code-generation/edit-model ik-import == ik
set code-generation/edit-model strategy/dao-api

# Keyboard codes
set key/up
set key/up keycode/38
set key/up browsername/ArrowUp
set key/down
set key/down keycode/40
set key/down browsername/ArrowDown
set key/left
set key/left keycode/37
set key/left browsername/ArrowLeft
set key/right
set key/right keycode/39
set key/right browsername/ArrowRight
set key/shift
set key/shift keycode/16
set key/shift browsername/Shift

set key/up action/move-up
set key/down action/move-down
set key/left action/move-left
set key/right action/move-right

set current-view spreadsheet-view/1
`