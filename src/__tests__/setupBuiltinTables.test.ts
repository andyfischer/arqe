
import Graph from '../Graph'
import findTableForQuery from '../findTableForQuery'
import { parsePattern } from '../parseCommand'

it("doesn't trigger FsFileContents for schema patterns", () => {
    const graph = new Graph();
    const table = findTableForQuery(graph, parsePattern("schema tableName/tsc-compile pattern(tsc-compile dir? filename? message? lineno? colno?)"));

    if (table)
        expect(table.name).not.toEqual('FsFileContents');
});
