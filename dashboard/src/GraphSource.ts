export default `
set typeinfo/branch inherits
set typeinfo/testcase inherits
set typeinfo/testcase order(before)
set typeinfo/typeinfo order(before)
set typeinfo/branch order(after)
    
set code-generation/dao
set code-generation/dao destination-filename(src/code-generation/DAOGeneratorGeneratedDAO.ts)
set code-generation/dao ik-import(..)
set code-generation/dao strategy/dao-api
# set code-generation/dao verbose-logging

set code-generation/dao touchpoint/0.5
set touchpoint/0.5 function-name(listTargets)
set touchpoint/0.5 query(code-generation/*)
set touchpoint/0.5 output tag/code-generation

set code-generation/dao touchpoint/0.5
set touchpoint/0.5 function-name(listTargets)
set touchpoint/0.5 query(code-generation/*)
set touchpoint/0.5 output tag/code-generation

set code-generation/dao touchpoint/0.6
set touchpoint/0.6 function-name(listTouchpoints)
set touchpoint/0.6 query(\${target} touchpoint/*)
set touchpoint/0.6 output tag/touchpoint
set touchpoint/0.6 input/0.5

set code-generation/dao touchpoint/0.8
set touchpoint/0.8 function-name(getIkImport)
set touchpoint/0.8 query(\${target} ik-import/*)
set touchpoint/0.8 output tagValue/ik-import
set touchpoint/0.8 expectOne
set touchpoint/0.8 input/0.5

set code-generation/dao touchpoint/1
set touchpoint/1 function-name(enableVerboseLogging)
set touchpoint/1 output exists
set touchpoint/1 query(\${target} verbose-logging)
set touchpoint/1 input/0.5
set input/0.5 name/target
set input/0.5 type/string

set code-generation/dao touchpoint/3
set touchpoint/3 query(\${touchpoint} function-name/*)
set touchpoint/3 function-name(touchpointFunctionName)
set touchpoint/3 input/1
set input/1 name/touchpoint
set input/1 type/string

set touchpoint/3 output tagValue/function-name
set touchpoint/3 expectOne

set code-generation/dao touchpoint/4
set touchpoint/4 query(\${touchpoint} expectOne)
set touchpoint/4 function-name(touchpointExpectOne)
set touchpoint/4 input/2
set touchpoint/4 output exists

set input/2 name/touchpoint
set input/2 type/string

set code-generation/dao touchpoint/isAsync
set touchpoint/isAsync query(\${touchpoint} async)
set touchpoint/isAsync function-name(touchpointIsAsync)
set touchpoint/isAsync input/2
set input/2 name/touchpoint
set input/2 type/string
set touchpoint/isAsync output exists

set code-generation/dao touchpoint/isListener
set touchpoint/isListener query(\${touchpoint} listener)
set touchpoint/isListener function-name(touchpointIsListener)
set touchpoint/isListener input/2
set touchpoint/isListener output exists

set code-generation/dao touchpoint/4.1
set touchpoint/4.1 query(\${touchpoint} output optional)
set touchpoint/4.1 function-name(touchpointOutputIsOptional)
set touchpoint/4.1 input/2
set input/2 name/touchpoint
set input/2 type/string
set touchpoint/4.1 output exists

set code-generation/dao touchpoint/5
set touchpoint/5 query(\${touchpoint} output value)
set touchpoint/5 function-name(touchpointOutputIsValue)
set touchpoint/5 input/3
set touchpoint/5 expectOne
set input/3 name/touchpoint
set input/3 type/string
set touchpoint/5 output exists

set code-generation/dao touchpoint/6
set touchpoint/6 query(\${touchpoint} output exists)
set touchpoint/6 function-name(touchpointOutputIsExists)
set touchpoint/6 input/4
set input/4 name/touchpoint
set input/4 type/string
set touchpoint/6 output exists

set code-generation/dao touchpoint/7
set touchpoint/7 query(\${touchpoint} output tagValue/*)
set touchpoint/7 function-name(touchpointTagValueOutputs)
set touchpoint/7 input/5
set touchpoint/7 output tagValue/tagValue
set input/5 name/touchpoint
set input/5 type/string

set code-generation/dao touchpoint/7.1
set touchpoint/7.1 query(\${touchpoint} output tagValue/*)
set touchpoint/7.1 function-name(touchpointTagValueOutput)
set touchpoint/7.1 input/5
set touchpoint/7.1 output tagValue/tagValue
set touchpoint/7.1 output optional
set touchpoint/7.1 expectOne
set input/5 name/touchpoint
set input/5 type/string

set code-generation/dao touchpoint/8
set touchpoint/8 query(\${touchpoint} output tag/*)
set touchpoint/8 function-name(touchpointTagOutputs)
set touchpoint/8 input/6
set touchpoint/8 output tagValue/tag
set input/6 name/touchpoint
set input/6 type/string

set code-generation/dao touchpoint/8.1
set touchpoint/8.1 query(\${touchpoint} output tag/*)
set touchpoint/8.1 function-name(touchpointTagOutput)
set touchpoint/8.1 input/6
set touchpoint/8.1 output tagValue/tag
set touchpoint/8.1 output optional
set touchpoint/8.1 expectOne
set input/6 name/touchpoint
set input/6 type/string

set code-generation/dao touchpoint/9
set touchpoint/9 query(\${touchpoint} output type/*)
set touchpoint/9 function-name(touchpointOutputType)
set touchpoint/9 input/7
set touchpoint/9 output tagValue/type
set touchpoint/9 output optional
set touchpoint/9 expectOne
set input/7 name/touchpoint
set input/7 type/string

set code-generation/dao touchpoint/10
set touchpoint/10 query(\${touchpoint} input/*)
set touchpoint/10 function-name(touchpointInputs)
set touchpoint/10 output tag/input
set touchpoint/10 input/touchpoint

set input/touchpoint name/touchpoint
set input/touchpoint type/string

set code-generation/dao touchpoint/10.5
set touchpoint/10.5 query(\${input} tagType/*)
set touchpoint/10.5 function-name(inputTagType)
set touchpoint/10.5 expectOne
set touchpoint/10.5 output tagValue/tagType
set touchpoint/10.5 output optional
set touchpoint/10.5 input/input

set code-generation/dao touchpoint/11
set touchpoint/11 query(\${input} name/*)
set touchpoint/11 function-name(inputName)
set touchpoint/11 output tagValue/name
set touchpoint/11 input/input
set touchpoint/11 expectOne

set input/input name/input
set input/input type/string
set input/input tagType/input

set code-generation/dao touchpoint/11.5
set touchpoint/11.5 query(\${input} sortOrder/*)
set touchpoint/11.5 function-name(inputSortOrder)
set touchpoint/11.5 output tagValue/sortOrder
set touchpoint/11.5 input/input
set touchpoint/11.5 expectOne
set touchpoint/11.5 output optional

set code-generation/dao touchpoint/12
set touchpoint/12 query(\${input} type/*)
set touchpoint/12 function-name(inputType)
set touchpoint/12 output tagValue/type
set touchpoint/12 output optional
set touchpoint/12 input/12
set touchpoint/12 expectOne
set input/12 name/input
set input/12 type/string

set code-generation/dao touchpoint/13
set touchpoint/13 query(\${touchpoint} query/*)
set touchpoint/13 function-name(touchpointQueryString)
set touchpoint/13 output tagValue/query
set touchpoint/13 input/13
set touchpoint/13 expectOne
set input/13 name/touchpoint
set input/13 type/string

set code-generation/dao touchpoint/14.1
set touchpoint/14.1 query(\${target} destination-filename/*)
set touchpoint/14.1 function-name(getDestinationFilename)
set touchpoint/14.1 output tagValue/destination-filename
set touchpoint/14.1 expectOne
set touchpoint/14.1 input/14.1

set input/14.1 name/target
set input/14.1 type/string

set code-generation/dao touchpoint/15
set touchpoint/15 query(\${touchpoint} output objectdef/*)
set touchpoint/15 function-name(getOutputObjectdef)
set touchpoint/15 output tag/objectdef
set touchpoint/15 expectOne
set touchpoint/15 input/15

set input/15 name/touchpoint
set input/15 type/string

set code-generation/dao touchpoint/16
set touchpoint/16 query(\${objectdef} objectfield/*)
set touchpoint/16 function-name(getObjectdefFields)
set touchpoint/16 output tag/objectdef
set touchpoint/16 input/16

set input/16 name/objectdef
set input/16 type/string

set code-generation/2
set code-generation/2 destination-filename(src/code-generation/CodeGenerationApi.ts)
set code-generation/2 ik-import(..)
set code-generation/2 strategy/dao-api

set code-generation/2 touchpoint/17.1
set touchpoint/17.1 query(code-generation/*)
set touchpoint/17.1 function-name(listCodeGenerationTargets)
set touchpoint/17.1 output tag/code-generation

set code-generation/2 touchpoint/17
set touchpoint/17 query(\${target} strategy/*)
set touchpoint/17 function-name(codeGenerationTargetStrategy)
set touchpoint/17 output tagValue/strategy
set touchpoint/17 expectOne
set touchpoint/17 input/0.5

set code-generation/3
set code-generation/3 destination-filename(src/code-generation/TextAsCodeApi.ts)
set code-generation/3 strategy/dao-api
set code-generation/3 ik-import(..)

set code-generation/3 touchpoint/18
set touchpoint/18 function-name(fromFile)
set touchpoint/18 query(\${target} from-file)
set touchpoint/18 output value
set touchpoint/18 expectOne
set touchpoint/18 input/0.5

set code-generation/3 touchpoint/19
set touchpoint/19 function-name(destinationFilename)
set touchpoint/19 query(\${target} destination-filename/*)
set touchpoint/19 output tagValue/destination-filename
set touchpoint/19 expectOne
set touchpoint/19 input/0.5

set input/touchpoint name/touchpoint
set input/touchpoint type/string

set code-generation/socket
set code-generation/socket destination-filename(src/code-generation/SocketApi.ts)
set code-generation/socket strategy/dao-api
set code-generation/socket ik-import(..)

set code-generation/socket touchpoint/socket1
set touchpoint/socket1 function-name(createUniqueConnection)
set touchpoint/socket1 query(set connection/(unique))
set touchpoint/socket1 output tag/connection
set touchpoint/socket1 expectOne

set code-generation/socket touchpoint/socket11
set touchpoint/socket11 function-name(getServerPort)
set touchpoint/socket11 query(get defaultServerPort/*)
set touchpoint/socket11 output tagValue/defaultServerPort
set touchpoint/socket11 expectOne

set code-generation/socket touchpoint/socket2
set touchpoint/socket2 function-name(deleteConnection)
set touchpoint/socket2 query(delete \${connection})
set touchpoint/socket2 input/connection

set input/connection name/connection
set input/connection type/string

set code-generation/dao touchpoint/20
set touchpoint/20 function-name(touchpointOutputObject)
set touchpoint/20 query(\${touchpoint} output output-object/*)
set touchpoint/20 output tag/output-object
set touchpoint/20 output optional
set touchpoint/20 expectOne
set touchpoint/20 input/touchpoint

set input/output-object name/outputObject
set input/output-object type/string

set code-generation/dao touchpoint/22
set touchpoint/22 function-name(outputObjectFields)
set touchpoint/22 query(\${outputObject} field/* tagValue/*)
set touchpoint/22 input/output-object
set touchpoint/22 output output-object/field-tag

set output-object/field-tag field/field tagValue/field
set output-object/field-tag field/tagValue tagValue/tagValue

set code-generation/dao touchpoint/23
set touchpoint/23 function-name(outputObjectTagFields)
set touchpoint/23 query(\${outputObject} field/* tag/*)
set touchpoint/23 input/output-object
set touchpoint/23 output output-object/field-tag2

set output-object/field-tag2 field/field tagValue/field
set output-object/field-tag2 field/tag tagValue/tag

set code-generation/dao touchpoint/24
set touchpoint/24 function-name(outputObjectTagValueFields)
set touchpoint/24 query(\${outputObject} field/* tagValue/*)
set touchpoint/24 input/output-object
set touchpoint/24 output output-object/field-tagValue

set output-object/field-tagValue field/field tagValue/field
set output-object/field-tagValue field/tagValue tagValue/tagValue

set code-generation/test-api
set code-generation/test-api destination-filename(src/__tests__/generated/GeneratedApi.ts)
set code-generation/test-api strategy/dao-api
set code-generation/test-api ik-import(../..)

set code-generation/test-api touchpoint/25
set touchpoint/25 function-name(getOneTag)
set touchpoint/25 query(a/1 b/*)
set touchpoint/25 expectOne
set touchpoint/25 output tag/b

set code-generation/test-api touchpoint/26
set touchpoint/26 function-name(getOneTagValue)
set touchpoint/26 query(a/1 b/*)
set touchpoint/26 expectOne
set touchpoint/26 output tagValue/b

set code-generation/test-api touchpoint/27
set touchpoint/27 function-name(getCurrentFlag)
set touchpoint/27 query(\${target} flag/*)
set touchpoint/27 expectOne
set touchpoint/27 output tagValue/flag
set touchpoint/27 input/target

set code-generation/test-api touchpoint/28
set touchpoint/28 function-name(getUsingCommandChain)
set touchpoint/28 query(get \${target} flag/*)
set touchpoint/28 expectOne
set touchpoint/28 output tagValue/flag
set touchpoint/28 input/target

set code-generation/test-api touchpoint/30
set touchpoint/30 function-name(changeFlag)
set touchpoint/30 query(delete \${target} flag/* | set \${target} flag/\${val})
set touchpoint/30 input/target
set touchpoint/30 input/val

set input/target name/target
set input/target type/string
set input/val name/val
set input/val type/string

### DASHBOARD ###

set code-generation/spreadsheet-view
set code-generation/spreadsheet-view destination-filename(dashboard/src/SpreadsheetViewAPI.ts)
set code-generation/spreadsheet-view ik-import(ik)
set code-generation/spreadsheet-view strategy/dao-api
# set code-generation/spreadsheet-view verbose-logging

set input/spreadsheet name/spreadsheet
set input/spreadsheet type/string

set code-generation/spreadsheet-view touchpoint/db1
set touchpoint/db1 function-name(listColumns)
set touchpoint/db1 query(\${spreadsheet} col/*)
set touchpoint/db1 output tag/col
set touchpoint/db1 input/spreadsheet

set code-generation/spreadsheet-view touchpoint/db2
set touchpoint/db2 function-name(listRows)
set touchpoint/db2 query(\${spreadsheet} row/*)
set touchpoint/db2 output tag/row
set touchpoint/db2 input/spreadsheet

set code-generation/spreadsheet-view touchpoint/db3
set touchpoint/db3 function-name(colName)
set touchpoint/db3 query(\${col} name/*)
set touchpoint/db3 expectOne
set touchpoint/db3 output tagValue/name
set touchpoint/db3 input/col

set code-generation/spreadsheet-view touchpoint/db4
set touchpoint/db4 function-name(getCellValue)
set touchpoint/db4 query(\${row} \${col})
set touchpoint/db4 expectOne
set touchpoint/db4 output value
set touchpoint/db4 output optional
set touchpoint/db4 input/col
set touchpoint/db4 input/row

set code-generation/spreadsheet-view touchpoint/db4.1
set touchpoint/db4.1 function-name(setCellValue)
set touchpoint/db4.1 query(delete \${row} \${col} | set \${row} \${col} == \${value})
set touchpoint/db4.1 input/col
set touchpoint/db4.1 input/row
set touchpoint/db4.1 input/value

set input/col name/col
set input/2 type/string

set input/row name/row
set input/row type/string

set input/value name/value
set input/value type/string
set input/value sortOrder/5

set code-generation/db2
set code-generation/db2 destination-filename(dashboard/src/GraphSource.ts)
set code-generation/db2 strategy/text-as-code
set code-generation/db2 from-file == src/source.graph

set spreadsheet/1

set spreadsheet/1 col/1
set spreadsheet/1 col/2
set spreadsheet/1 col/3
set spreadsheet/1 row/1
set spreadsheet/1 row/2

set col/1 name/"Customer Name"
set col/2 name/"Customer Email"
set col/3 name/Status

set row/1 col/1 == Bob
set row/1 col/2 == bob@email.com
set row/1 col/3 == Active

set row/2 col/1 == Karen
set row/2 col/2 == karen@email.com
set row/2 col/3 == Inactive

set code-generation/spreadsheet-view touchpoint/db5
set code-generation/edit-model touchpoint/db5
set touchpoint/db5 function-name(spreadsheetForView)
set touchpoint/db5 query(\${spreadsheetView} spreadsheet/*)
set touchpoint/db5 expectOne
set touchpoint/db5 output tag/spreadsheet
set touchpoint/db5 output optional
set touchpoint/db5 input/spreadsheetView
set input/spreadsheetView name/spreadsheetView
set input/spreadsheetView type/string

set code-generation/spreadsheet-view touchpoint/db6
set touchpoint/db6 function-name(getSelectedCell)
set touchpoint/db6 query(\${spreadsheetView} selection col/* row/*)
set touchpoint/db6 expectOne
set touchpoint/db6 input/spreadsheetView
set touchpoint/db6 output output-object/row-col
set touchpoint/db6 output optional

set output-object/row-col field/col tag/col
set output-object/row-col field/row tag/row

set code-generation/edit-model touchpoint/db7
set touchpoint/db7 function-name(findKeyForBrowserName)
set touchpoint/db7 query(key/* browsername/\${browserName})
set touchpoint/db7 expectOne
set touchpoint/db7 output optional
set touchpoint/db7 input/browserName
set touchpoint/db7 output tag/key

set input/browserName type/string
set input/browserName name/browserName

set input/key type/string
set input/key name/key

# Spreadsheet View
set spreadsheet-view/1 spreadsheet/1
set spreadsheet-view/1 selection col/1 row/2

set current-view spreadsheet-view/1

set code-generation/edit-model
set code-generation/edit-model destination-filename(dashboard/src/EditModelAPI.ts)
set code-generation/edit-model ik-import(ik)
set code-generation/edit-model strategy/dao-api

set code-generation/edit-model touchpoint/db8
set touchpoint/db8 function-name(findActionForKey)
set touchpoint/db8 query(\${key} action/*)
set touchpoint/db8 expectOne
set touchpoint/db8 output optional
set touchpoint/db8 input/key
set touchpoint/db8 output tag/action

set code-generation/edit-model touchpoint/db9
set touchpoint/db9 function-name(getCurrentView)
set touchpoint/db9 query(current-view spreadsheet-view/*)
set touchpoint/db9 expectOne
set touchpoint/db9 output tag/spreadsheet-view

set code-generation/edit-model touchpoint/db10
set touchpoint/db10 function-name(getSpreadsheetSelectionPos)
set touchpoint/db10 query(\${view} selection col/* row/*)
set touchpoint/db10 expectOne
set touchpoint/db10 input/view
set touchpoint/db10 output tag/spreadsheet-view
set touchpoint/db10 output output-object/row-col

set input/view name/view
set input/view type/string
set input/view sortOrder/-1

set code-generation/edit-model touchpoint/db11
set touchpoint/db11 function-name(getMoveActionDelta)
set touchpoint/db11 query(\${action} delta-x/* delta-y/*)
set touchpoint/db11 expectOne
set touchpoint/db11 output optional
set touchpoint/db11 input/action
set touchpoint/db11 output output-object/moveActionDelta

set input/action name/action
set input/action type/string

set output-object/moveActionDelta field/x tagValue/delta-x
set output-object/moveActionDelta field/x type/integer
set output-object/moveActionDelta field/y tagValue/delta-y
set output-object/moveActionDelta field/y type/integer

set code-generation/edit-model touchpoint/db12
set touchpoint/db12 function-name(rowOrColExists)
set touchpoint/db12 query(\${spreadsheet} \${item})
set touchpoint/db12 expectOne
set touchpoint/db12 output optional
set touchpoint/db12 input/item
set touchpoint/db12 input/spreadsheet
set touchpoint/db12 output exists

set code-generation/spreadsheet-view touchpoint/db13
set code-generation/edit-model touchpoint/db13
set touchpoint/db13 function-name(clearSelection)
set touchpoint/db13 query(delete \${spreadsheet} selection row/* col/*)
set touchpoint/db13 input/spreadsheet

set code-generation/spreadsheet-view touchpoint/db14
set code-generation/edit-model touchpoint/db14
set touchpoint/db14 function-name(setSelection)
set touchpoint/db14 query(set \${view} selection \${row} \${col})
set touchpoint/db14 input/view
set touchpoint/db14 input/row
set touchpoint/db14 input/col

set code-generation/edit-model touchpoint/db15
set touchpoint/db15 function-name(startEditing)
set touchpoint/db15 query(set \${view} now-editing)
set touchpoint/db15 input/view

set code-generation/edit-model touchpoint/db16
set touchpoint/db16 function-name(stopEditing)
set touchpoint/db16 query(delete \${view} now-editing)
set touchpoint/db16 input/view

set code-generation/spreadsheet-view touchpoint/db17
set code-generation/edit-model touchpoint/db17
set touchpoint/db17 function-name(isEditing)
set touchpoint/db17 query(\${view} now-editing)
set touchpoint/db17 input/view
set touchpoint/db17 output exists

set code-generation/edit-model touchpoint/db18
set touchpoint/db18 function-name(getInputMode)
set touchpoint/db18 query(\${view} input-mode/*)
set touchpoint/db18 input/view
set touchpoint/db18 expectOne
set touchpoint/db18 output tagValue/input-mode

set code-generation/edit-model touchpoint/db19
set touchpoint/db19 function-name(setInputMode)
set touchpoint/db19 query(delete \${view} input-mode/* | set \${view} \${inputMode})
set touchpoint/db19 inputs == view input-mode
set touchpoint/db19 input/view
set touchpoint/db19 input/input-mode

set input/input-mode tagType/input-mode
set input/input-mode name/inputMode
set input/input-mode type/string

set code-generation/edit-model touchpoint/db20
set touchpoint/db20 function-name(findActionForKeyInMode)
set touchpoint/db20 query(get \${view} input-mode/\$m | join \${key} action/* active-for-mode input-mode/\$m)
set touchpoint/db20 input/view
set touchpoint/db20 input/key
set touchpoint/db20 expectOne
set touchpoint/db20 output optional
set touchpoint/db20 output tag/action

set code-generation/watch-file
set code-generation/watch-file destination-filename(src/file-watch/WatchFileApi.ts)
set code-generation/watch-file ik-import(..)
set code-generation/watch-file strategy/dao-api

set code-generation/watch-file touchpoint/findWatch
set touchpoint/findWatch query(file-watch filename(\${filename}) version)
set touchpoint/findWatch function-name/findFileWatch
set touchpoint/findWatch input/filename
set touchpoint/findWatch expectOne
set touchpoint/findWatch async
set touchpoint/findWatch output tag/file-watch
set touchpoint/findWatch output optional

set code-generation/watch-file touchpoint/findWatch2
set touchpoint/findWatch2 query(file-watch filename(\${filename}) version)
set touchpoint/findWatch2 function-name/findFileWatch2
set touchpoint/findWatch2 input/filename
set touchpoint/findWatch2 expectOne
set touchpoint/findWatch2 async
set touchpoint/findWatch2 output tag/file-watch
set touchpoint/findWatch2 output optional

set input/filename name/filename
set input/filename type/string

set code-generation/watch-file touchpoint/listenToFile
set touchpoint/listenToFile query(listen -get \${watch} filename version)
set touchpoint/listenToFile function-name/listenToFile
set touchpoint/listenToFile input/file-watch
set touchpoint/listenToFile expectOne
set touchpoint/listenToFile listener
set touchpoint/listenToFile output tagValue/version

set code-generation/watch-file touchpoint/postChange
set touchpoint/postChange query(set file-watch/* filename/\${filename} version/(increment))
set touchpoint/postChange function-name/postChange
set touchpoint/postChange input/filename
set touchpoint/postChange async

set code-generation/watch-file touchpoint/findWatchesForFilename
set touchpoint/findWatchesForFilename query(get file-watch/* filename/\${filename} version)
set touchpoint/findWatchesForFilename function-name/findWatchesForFilename
set touchpoint/findWatchesForFilename input/filename
set touchpoint/findWatchesForFilename async
set touchpoint/findWatchesForFilename output tag/file-watch
set code-generation/watch-file touchpoint/findWatchesForFilename

set code-generation/watch-file touchpoint/createWatch
set touchpoint/createWatch query(set file-watch/(unique) filename/\${filename} version/0)
set touchpoint/createWatch function-name/createWatch
set touchpoint/createWatch input/filename
set touchpoint/createWatch async
set touchpoint/createWatch expectOne
set touchpoint/createWatch output tag/file-watch

set code-generation/watch-file touchpoint/incrementVersion
set touchpoint/incrementVersion query(set file-watch/* filename/\${filename} version/(increment))
set touchpoint/incrementVersion function-name/incrementVersion
set touchpoint/incrementVersion input/filename
set touchpoint/incrementVersion async

set input/file-watch name/watch
set input/file-watch type/string

set input/row name/row
set input/row type/string
set input/row sortOrder/2

set input/col name/col
set input/col type/string
set input/col sortOrder/1

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
set key/enter action/toggle-editing

set key/enter action/stop-editing active-for-mode input-mode/text-editing
set key/enter action/start-editing active-for-mode input-mode/normal

set action/move-up delta-x/0 delta-y/-1
set action/move-down delta-x/0 delta-y/1
set action/move-left delta-x/-1 delta-y/0
set action/move-right delta-x/1 delta-y/0

set current-view spreadsheet-view/1
set spreadsheet-view/1 input-mode/normal

# Filesystem
#set object-type/file-watch
#set object-type/file-watch attribute/filename
#set object-type/file-watch attribute/last-modified
#set object-type/file-watch attribute/version

# Server
set defaultServerPort/42940

# Auto rebuilder

set code-generation/autobuildbot
set code-generation/autobuildbot destination-filename(autobuildbot/src/BuildBotAPI.ts)
set code-generation/autobuildbot ik-import(./fs)
set code-generation/autobuildbot strategy/dao-api

set code-generation/autobuildbot touchpoint/listenToFileChanges
set touchpoint/listenToFileChanges query(listen file-watch filename/* version)
set touchpoint/listenToFileChanges function-name/listenToFileChanges
set touchpoint/listenToFileChanges listener
set touchpoint/listenToFileChanges output tagValue/filename

set code-generation/autobuildbot touchpoint/findTasksByCommand
set touchpoint/findTasksByCommand query(get build-task/* cmd(\${cmd}) status)
set touchpoint/findTasksByCommand function-name/findTasksByCommand
set touchpoint/findTasksByCommand input/cmd
set touchpoint/findTasksByCommand output tag/build-task
set touchpoint/findTasksByCommand async

set code-generation/autobuildbot touchpoint/createBuildTask
set touchpoint/createBuildTask query(set build-task/(unique) cmd(\${cmd}) status/\${status})
set touchpoint/createBuildTask function-name/createBuildTask
set touchpoint/createBuildTask input/cmd
set touchpoint/createBuildTask input/status
set touchpoint/createBuildTask expectOne
set touchpoint/createBuildTask output tag/build-task
set touchpoint/createBuildTask async

set code-generation/autobuildbot touchpoint/taskStatus
set touchpoint/taskStatus query(get build-task/\${task} cmd status)
set touchpoint/taskStatus function-name/taskStatus
set touchpoint/taskStatus input/task
set touchpoint/taskStatus expectOne
set touchpoint/taskStatus output tagValue/status
set touchpoint/taskStatus async

set code-generation/autobuildbot touchpoint/setPendingTaskTimer
set touchpoint/setPendingTaskTimer query(set build-task(\${task}) pending-task-timer expires-at(\${expiresAt}))
set touchpoint/setPendingTaskTimer function-name/setPendingTaskTimer
set touchpoint/setPendingTaskTimer input/task
set touchpoint/setPendingTaskTimer input/expiresAt
set touchpoint/setPendingTaskTimer expectOne
set touchpoint/setPendingTaskTimer output tagValue/status
set touchpoint/setPendingTaskTimer async

set code-generation/autobuildbot touchpoint/listenToPendingTasks
set touchpoint/listenToPendingTasks query(listen build-task/* pending-task-timer expires-at)
set touchpoint/listenToPendingTasks function-name/listenToPendingTasks
set touchpoint/listenToPendingTasks output tagValue/status
set touchpoint/listenToPendingTasks listener

set input/cmd name/cmd
set input/cmd type/string

set input/status name/status
set input/status type/string

set input/expiresAt name/expiresAt
set input/expiresAt type/string

set input/task name/task
set input/task type/string

`