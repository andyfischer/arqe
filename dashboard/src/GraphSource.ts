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
set code-generation/edit-model touchpoint/5
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
set touchpoint/6 output output-object/row-col
set touchpoint/6 output optional

set output-object/row-col field/col tag/col
set output-object/row-col field/row tag/row

set code-generation/edit-model touchpoint/7
set touchpoint/7 function-name == findKeyForBrowserName
set touchpoint/7 query == key/* browsername/\${browserName}
set touchpoint/7 expectOne
set touchpoint/7 output optional
set touchpoint/7 input/browserName
set touchpoint/7 output tag/key

set input/browserName type/string
set input/browserName name/browserName

set input/key type/string
set input/key name/key

# Spreadsheet View
set spreadsheet-view/1 spreadsheet/1
set spreadsheet-view/1 selection col/1 row/2

set current-view spreadsheet-view/1

set code-generation/edit-model
set code-generation/edit-model destination-filename == src/EditModelAPI.ts
set code-generation/edit-model ik-import == ik
set code-generation/edit-model strategy/dao-api

set code-generation/edit-model touchpoint/8
set touchpoint/8 function-name == findActionForKey
set touchpoint/8 query == \${key} action/*
set touchpoint/8 expectOne
set touchpoint/8 output optional
set touchpoint/8 input/key
set touchpoint/8 output tag/action

set code-generation/edit-model touchpoint/9
set touchpoint/9 function-name == getCurrentView
set touchpoint/9 query == current-view spreadsheet-view/*
set touchpoint/9 expectOne
set touchpoint/9 output tag/spreadsheet-view

set code-generation/edit-model touchpoint/10
set touchpoint/10 function-name == getSpreadsheetSelectionPos
set touchpoint/10 query == \${view} selection col/* row/*
set touchpoint/10 expectOne
set touchpoint/10 input/view
set touchpoint/10 output tag/spreadsheet-view
set touchpoint/10 output output-object/row-col

set input/view name/view
set input/view type/string

set code-generation/edit-model touchpoint/11
set touchpoint/11 function-name == getMoveActionDelta
set touchpoint/11 query == \${action} delta-x/* delta-y/*
set touchpoint/11 expectOne
set touchpoint/11 output optional
set touchpoint/11 input/action
set touchpoint/11 output output-object/moveActionDelta

set input/action name/action
set input/action type/string

set output-object/moveActionDelta field/x tagValue/delta-x
set output-object/moveActionDelta field/x type/integer
set output-object/moveActionDelta field/y tagValue/delta-y
set output-object/moveActionDelta field/y type/integer

set code-generation/edit-model touchpoint/12
set touchpoint/12 function-name == rowOrColExists
set touchpoint/12 query == \${spreadsheet} \${item}
set touchpoint/12 expectOne
set touchpoint/12 output optional
set touchpoint/12 input/item
set touchpoint/12 input/spreadsheet
set touchpoint/12 output exists

set code-generation/spreadsheet-view touchpoint/13
set code-generation/edit-model touchpoint/13
set touchpoint/13 function-name == clearSelection
set touchpoint/13 query == delete \${spreadsheet} selection row/* col/*
set touchpoint/13 input/spreadsheet

set code-generation/spreadsheet-view touchpoint/14
set code-generation/edit-model touchpoint/14
set touchpoint/14 function-name == setSelection
set touchpoint/14 query == set \${view} selection \${row} \${col}
set touchpoint/14 input/view
set touchpoint/14 input/row
set touchpoint/14 input/col

set code-generation/edit-model touchpoint/15
set touchpoint/15 function-name == startEditing
set touchpoint/15 query == set \${view} now-editing
set touchpoint/15 input/view

set code-generation/edit-model touchpoint/16
set touchpoint/16 function-name == stopEditing
set touchpoint/16 query == delete \${view} now-editing
set touchpoint/16 input/view

set code-generation/spreadsheet-view touchpoint/17
set code-generation/edit-model touchpoint/17
set touchpoint/17 function-name == isEditing
set touchpoint/17 query == \${view} now-editing
set touchpoint/17 input/view
set touchpoint/17 output exists

set input/row name/row
set input/row type/string

set input/col name/col
set input/col type/string

set input/item name/item
set input/item type/string

set input/spreadsheet name/spreadsheet
set input/spreadsheet type/string

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
set key/enter
set key/enter browsername/Enter

set key/up action/move-up
set key/down action/move-down
set key/left action/move-left
set key/right action/move-right
set key/enter action/start-editing

set action/move-up delta-x/0 delta-y/-1
set action/move-down delta-x/0 delta-y/1
set action/move-left delta-x/-1 delta-y/0
set action/move-right delta-x/1 delta-y/0

set current-view spreadsheet-view/1
`