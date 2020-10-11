
# Example (filesystem)

    graph.addTables(setupTableSetV2({
        'filename file-contents': {
            'find-with filename': async (input: Tuple, out: TableCallbackContext) => {
                out.oneObject({
                    'file-contents': await fs.readFile(filename, 'utf8')
                })
            },
            'insert filename file-contents': async (input: Tuple, out: TableCallbackContext) => {
                const { filename, 'file-contents': contents } = input.obj();
                await fs.writeFile(filename, contents);
                out.done()
            },
            'delete filename': async (input: Tuple, out: TableCallbackContext) => {
                const { filename } = input.obj();
                await fs.unlink(filename);
                out.done();
            }
        }
    })

# Definable verbs

|                              |
| ---------------------------- | ------------------------------------------------------- |
| **get** <required attrs>    | Used by `get` command. If this command is defined then it overrides the remaining logic (find-with / list-all) |
| **find-with** <required attrs> | Used during `get` command, if there are definite values for all of <required attrs>. |
| **list-all** <required attrs>  | Used during `get` command, if there are definite values for all of <required attrs>. This is expected to overprovide matching rows, and the runtime will do another filter step to check if the results fit the query. Typically this command is defined with no <required attrs>. |
| **insert** <required attrs> | Used during `set` or `insert` commands. |
| **insert** <attr>(unique)   | Used during `set` or `insert` commands. Only matches if the query has a matching ((unique)) expression. |
| **set** <required attrs>    | Used during `set` command. Overrides the remaining logic for `set` |
| **update** <required attrs> | Used during `set` or `update` command. |
| **delete** <required attrs> | Used during `set` or `delete` command. |






