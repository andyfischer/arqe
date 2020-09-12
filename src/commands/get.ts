
import Tuple from '../Tuple'
import Stream from '../Stream'
import { emitSearchPatternMeta, emitCommandError } from '../CommandMeta'
import { combineStreams, joinNStreams_v2 } from '../StreamUtil'
import TableMount from '../TableMount'
import findPartitionsByTable from '../findPartitionsByTable'
import QueryContext from '../QueryContext'

export function getOnOneTable(cxt: QueryContext, table: TableMount, tuple: Tuple, out: Stream) {

    cxt.start('getOnOneTable', { tableName: table.name, tuple: tuple.stringify() });

    cxt.msg(`looking for 'get' handler`);
    if (table.callWithDefiniteValues(cxt, 'get', tuple, out)) {
        cxt.msg(`used 'get' handler`);
        cxt.end('getOnOneTable');
        return;
    }

    cxt.msg(`looking for 'find-with' handler`);
    if (table.callWithDefiniteValues(cxt, 'find-with', tuple, out)) {
        cxt.msg('used find-with handler');
        cxt.end('getOnOneTable');
        return;
    }

    cxt.msg(`looking for 'list-all' handler`);
    if (table.callWithDefiniteValues(cxt, 'list-all', tuple, {
            next(t: Tuple) {
                if (tuple.isSupersetOf(t))
                    out.next(t);
            },
            done() { out.done() }
        })) {

        cxt.msg('used list-all handler');
        cxt.end('getOnOneTable');
        return;
    }

    // Fail
    cxt.msg('no handler found');
    emitCommandError(out, `No handler found on table '${table.name}' for command: ${tuple.stringify()}`);
    out.done();
    cxt.end('getOnOneTable');
}

function maybeAnnotateWithIdentifiers(searchPattern: Tuple, out: Stream) {
    let hasAnyIdentifiers = false;
    const attrToIdentifier = {};

    for (const tag of searchPattern.tags) {
        if (tag.hasIdentifier()) {
            hasAnyIdentifiers = true;
            attrToIdentifier[tag.attr] = tag.identifier;
        }
    }

    if (!hasAnyIdentifiers)
        return out;

    return {
        next(t) {
            out.next(t.remapTags(tag => {
                if (!tag.attr)
                    return tag;

                const ident = attrToIdentifier[tag.attr];
                if (ident) {
                    return tag.setIdentifier(ident);
                }

                return tag;
            }))
        },
        done() {
            out.done()
        }
    }
}

export function runGet(cxt: QueryContext, searchPattern: Tuple, out: Stream) {
    if (!searchPattern)
        throw new Error('missing filterPattern or tuple');

    cxt.start("runGet", { searchPattern: searchPattern.stringify() })

    out = maybeAnnotateWithIdentifiers(searchPattern, out);

    const combined = combineStreams(out);
    const startedAllTables = combined();

    let foundAnyTables = false;

    for (const [table, partitionedTuple] of findPartitionsByTable(cxt, searchPattern)) {
        const tableOut = combined();
        getOnOneTable(cxt, table, partitionedTuple, tableOut);
        foundAnyTables = true;
    }

    if (!foundAnyTables && !cxt.graph.options.autoinitMemoryTables) {
        cxt.msg('no table found');
        emitCommandError(out, "No table found for: " + searchPattern.stringify());
    }

    startedAllTables.done();
    cxt.end('runGet');
}

export default function runGetStep(cxt: QueryContext, tuple: Tuple, out: Stream) {
    // input passthrough
    // console.log(cxt.input.output);

    const combined = joinNStreams_v2(2, out);

    cxt.input.sendTo(combined);

    emitSearchPatternMeta(tuple, combined);
    runGet(cxt, tuple, combined);
}
