
import Tuple, { newTuple } from '../Tuple'
import { newSimpleTag } from '../Tag'
import Stream from '../Stream'
import { emitSearchPatternMeta, asCommandMeta, tableNotFoundError, tableDoesntSupportOperation } from '../CommandUtils'
import { combineStreams, joinNStreams_v2 } from '../StreamUtil'
import TableMount from '../TableMount'
import { callTableHandler } from '../callTableHandler'
import findTablesForPattern from '../findTablesForPattern'
import QueryContext from '../QueryContext'
import { splitTuple, abstractHoles } from '../Tuple'
import CommandParams from '../CommandParams'
import Pipe, { newPrefilledPipe, joinPipes } from '../Pipe'

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

        if (fromPattern.hasValue() && resultTag.value !== fromPattern.value) {
            return null;
        }
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

function getOnOneTable(cxt: QueryContext, table: TableMount, searchPattern: Tuple, getMeta: Tuple): Pipe {

    // should this rename to "alias" or similar ?
    const getHandler = table.findHandler(cxt, 'get', searchPattern);
    if (getHandler) {
        //const out = new Pipe();
        return callTableHandler(table.schema, getHandler, cxt, searchPattern)
    }

    // Check if there is a 'find' handler
    //   If it matches fixed values then call it.
    //   If it matches abstractly then return the abstract result.

    const find = table.findHandler(cxt, 'find', searchPattern);

    if (getMeta.getOptional('get.scope', null) === 'handlercheck') {
        if (find) {
            // Yes we have a handler for this pattern.
            return newPrefilledPipe([abstractHoles(searchPattern)]);
        } else {
            // No handler for this pattern.
            return newPrefilledPipe([tableDoesntSupportOperation('find', searchPattern)]);
        }
    }

    if (find) {
        return (callTableHandler(table.schema, find, cxt, searchPattern)
        .map((t:Tuple) => {
            return limitResultToSearchPattern(t, searchPattern);
        }, 'limitResultToSearchPattern'));
    }

    // Fail
    return emptyResultFromError(searchPattern, tableDoesntSupportOperation('get', searchPattern))
}

function maybeAnnotateWithIdentifiers(searchPattern: Tuple) {
    let hasAnyIdentifiers = false;
    const attrToIdentifier = {};

    for (const tag of searchPattern.tags) {
        if (tag.hasIdentifier()) {
            hasAnyIdentifiers = true;
            attrToIdentifier[tag.attr] = tag.identifier;
        }
    }

    if (!hasAnyIdentifiers)
        return (t) => t;

    return (t:Tuple) => {
        return t.remapTags(tag => {
            if (!tag.attr)
                return tag;

            const ident = attrToIdentifier[tag.attr];
            if (ident) {
                return tag.setIdentifier(ident);
            }

            return tag;
        });
    }
}

function runGet(cxt: QueryContext, searchPattern: Tuple, getMeta: Tuple) {
    if (!searchPattern)
        throw new Error('missing searchPattern');

    if (searchPattern.isEmpty()) {
        return newPrefilledPipe([]);
    }

    const tableOuts: Pipe[] = []

    for (const [table, partitionedTuple] of findTablesForPattern(cxt.graph, searchPattern)) {
        const tableOut = getOnOneTable(cxt, table, partitionedTuple, getMeta);
        tableOuts.push(tableOut);
    }

    if (tableOuts.length === 0) {
        return emptyResultFromError(searchPattern, tableNotFoundError(searchPattern));
    }

    return (joinPipes(tableOuts)
            .map(maybeAnnotateWithIdentifiers(searchPattern), 'maybeAnnotateWithIdentifiers'));
}

function emptyResultFromError(searchPattern: Tuple, error: Tuple): Pipe {
    if (searchPattern.hasAnyAbstractValues()) {
        return newPrefilledPipe([
            searchPattern.remapTags(tag => {
                if (tag.isAbstractValue()) {
                    return tag.setValue(newTuple([newSimpleTag('empty'), newSimpleTag('reason', error)]));
                } else {
                    return tag;
                }
            })
        ]);
    } else {
        return newPrefilledPipe([asCommandMeta(error)]);
    }
}

export default function runGetVerb(params: CommandParams) {

    const { scope, tuple, output } = params;

    let [ getMeta, searchPattern ] = splitTuple(tuple, tag => tag.attr === 'get.scope');

    const getResult = new Pipe('get');
    emitSearchPatternMeta(searchPattern, getResult);

    runGet(scope, searchPattern, getMeta)
    .sendTo(getResult);

    joinPipes([scope.input, getResult])
    .sendTo(output);
}
