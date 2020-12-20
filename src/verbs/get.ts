
import Tuple, { newTuple } from '../Tuple'
import { newSimpleTag } from '../TupleTag'
import Stream from '../Stream'
import { emitSearchPatternMeta, asCommandMeta, tableNotFoundError, tableDoesntSupportOperation } from '../CommandUtils'
import { combineStreams, joinNStreams_v2 } from '../StreamUtil'
import TableMount from '../TableMount'
import { callTableHandler } from '../callTableHandler'
import findTablesForPattern from '../findTablesForPattern'
import QueryContext from '../QueryContext'
import { splitTuple, abstractHoles } from '../operations'

function limitResultToSearchPattern(tuple: Tuple, searchPattern: Tuple) {
    if (tuple.isCommandMeta())
        return tuple;

    // Check for any conditions that invalidate the tuple
    let hasExtraTags = false;
    for (const resultTag of tuple.tags) {
        const fromPattern = searchPattern.getTag(resultTag.attr);
        if (!fromPattern) {
            hasExtraTags = true;
            continue;
        }

        if (fromPattern.hasValue() && resultTag.value !== fromPattern.value)
            return null;
    }

    // Throw out extra values that the search didn't ask for
    if (hasExtraTags) {
        return tuple.remapTags(resultTag => {
            const fromPattern = searchPattern.getTag(resultTag.attr);
            if (!fromPattern)
                return null;

            return resultTag;
        });
    }

    return tuple;
}

function getOnOneTable(cxt: QueryContext, table: TableMount, searchPattern: Tuple, getMeta: Tuple, out: Stream) {

    cxt.start('getOnOneTable', { tableName: table.name, tuple: searchPattern.stringify() });

    // should this rename to "alias" or similar ?
    if (table.callWithDefiniteValues(cxt, 'get', searchPattern, out)) {
        cxt.msg(`used 'get' handler`);
        cxt.end('getOnOneTable');
        return;
    }

    // Check if there is a 'find' handler
    //   If it matches fixed values then call it.
    //   If it matches abstractly then return the abstract result.

    const definiteFind = table.findHandler(cxt, 'find', searchPattern);

    if (getMeta.getOptional('get.scope', null) === 'handlercheck') {
        if (definiteFind) {
            // Yes we have a handler for this pattern.
            out.next(abstractHoles(searchPattern));
            out.done();
        } else {
            // No handler for this pattern.
            out.next(tableDoesntSupportOperation('find', searchPattern));
            out.done();
        }
        return;
    }

    if (definiteFind) {
        const filteredOutput: Stream = {
            next(t) {
                t = limitResultToSearchPattern(t, searchPattern);
                if (t)
                    out.next(t);
            },
            done() { out.done() }
        }

        callTableHandler(cxt, definiteFind, searchPattern, filteredOutput);
        return;
    }

    // Fail
    cxt.msg('no handler found');
    emptyResultFromError(out, searchPattern, tableDoesntSupportOperation('get', searchPattern));
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

function runGet(cxt: QueryContext, searchPattern: Tuple, getMeta: Tuple, out: Stream) {
    if (!searchPattern)
        throw new Error('missing searchPattern');

    if (searchPattern.isEmpty()) {
        out.done();
        return;
    }

    cxt.start("runGet", { searchPattern: searchPattern.stringify() })

    out = maybeAnnotateWithIdentifiers(searchPattern, out);

    const combined = combineStreams(out);
    const startedAllTables = combined();

    let foundAnyTables = false;

    for (const [table, partitionedTuple] of findTablesForPattern(cxt.graph, searchPattern)) {
        const tableOut = combined();
        getOnOneTable(cxt, table, partitionedTuple, getMeta, tableOut);
        foundAnyTables = true;
    }

    if (!foundAnyTables) {
        emptyResultFromError(out, searchPattern, tableNotFoundError(searchPattern));
    }

    startedAllTables.done();
    cxt.end('runGet');
}

function emptyResultFromError(out: Stream, searchPattern: Tuple, error: Tuple) {
    if (searchPattern.hasAnyAbstractValues()) {
        out.next(searchPattern.remapTags(tag => {
            if (tag.isAbstractValue()) {
                return tag.setValue(newTuple([newSimpleTag('empty'), newSimpleTag('reason', error)]));
            } else {
                return tag;
            }
        }));
    } else {
        out.next(asCommandMeta(error));
    }
}

function extractGetScopeAttrs(tuple: Tuple) {

}

export default function runGetStep(cxt: QueryContext, tuple: Tuple, out: Stream) {
    const combined = joinNStreams_v2(2, out);

    cxt.input.sendTo(combined);

    let [ getMeta, searchPattern ] = splitTuple(tuple, tag => tag.attr === 'get.scope');

    emitSearchPatternMeta(searchPattern, combined);
    runGet(cxt, searchPattern, getMeta, combined);
}
