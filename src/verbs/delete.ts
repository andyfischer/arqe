import { combineStreams } from "../StreamUtil";
import { Graph, Tuple, Stream } from "..";
import Tag, { newTag } from "../Tag";
import CommandExecutionParams from '../CommandParams'
import TableMount from "../TableMount";
import findTablesForPattern from "../findTablesForPattern";
import QueryContext from "../QueryContext";

export function stripDeleteTag(tuple: Tuple) {
    return tuple.remapTags((tag: Tag) => {
        if (tag.attr === 'deleted')
            return null;
        return tag
    });
}

export function deleteOnOneTable(cxt: QueryContext, table: TableMount, tuple: Tuple, out: Stream) {

    tuple = stripDeleteTag(tuple);

    table.callWithDefiniteValuesOrError(cxt, 'delete', tuple, {
        next(t: Tuple) {
            const deletedMessage = t.addTag(newTag('deleted'));
            out.next(deletedMessage);
        },
        done: out.done
    });
}

export function deletePlanned(cxt: QueryContext, searchPattern: Tuple, output: Stream) {
    const collectOutput = combineStreams(output);

    const allTables = collectOutput();
    for (const [table, tablePattern] of findTablesForPattern(cxt.graph, searchPattern)) {
        const tableOut = collectOutput();
        deleteOnOneTable(cxt, table, tablePattern, tableOut);

        table.pushChangeEvent(cxt);
    }

    allTables.done();
}

export default function deleteCommand(params: CommandExecutionParams) {
    const { tuple, output, scope } = params;

    const deletePattern = tuple.addTag(newTag('deleted').setValueExpr(['set']));

    deletePlanned(scope, tuple, output);
}
