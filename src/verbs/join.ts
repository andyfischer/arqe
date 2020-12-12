
import CommandParams from '../CommandParams'
import Tuple, { newTuple } from '../Tuple';
import TupleTag, { newSimpleTag } from '../TupleTag';
import Stream from '../Stream';
import { receiveToTupleList } from '../receiveUtils';
import Relation from '../Relation';
import { joinNStreams } from '../StreamUtil';
import AutoInitMap from '../utils/AutoInitMap';
import { emitCommandError, emitSearchPatternMeta, jsErrorToTuple, errorMessage } from '../CommandUtils';
import QueryContext from '../QueryContext';
import Pipe from '../Pipe'
import { combineStreams } from '../StreamUtil'
import { splitTuple } from '../operations'
import { toTuple } from '../coerce'

interface JoinStrategy {
    pairs: {
        leftAttr: string
        rightAttr: string
    }[]
    error?: Tuple
}

class FoundIdentifier {
    str: string
    foundRelCount = 0
    byRelIndex = new Map<number, TupleTag>()

    constructor(str: string) {
        this.str = str;
    }

    add(relIndex: number, tag: TupleTag) {
        this.foundRelCount++;
        this.byRelIndex.set(relIndex, tag);
    }
}

class JoiningRelation {
    rel: Relation
    index: number
    attrToIdentifier = new Map<string, string>();

    constructor(index: number, rel: Relation) {
        this.index = index;
        this.rel = rel;
    }
}

function combineTuples(tuples: Tuple[]) {
    const sawAttr = {}
    const tags = [];

    for (const tuple of tuples) {
        for (const tag of tuple.tags) {
            if (tag.attr && sawAttr[tag.attr])
                continue;
            tags.push(tag);
            sawAttr[tag.attr] = true;
        }
    }

    return newTuple(tags);
}

function joinRelations(left: Relation, right: Relation, out: Stream) {

    const lhsHeader = left.header();
    const rhsHeader = right.header();

    for (const t of left.tuples) {
        if (t.isError()) {
            out.next(t);
            out.done();
            return;
        }
    }

    for (const t of right.tuples) {
        if (t.isError()) {
            out.next(t);
            out.done();
            return;
        }
    }

    if (lhsHeader.isError()) {
        console.log('no lhs header: ', left.stringify())
        out.next(lhsHeader);
        out.done();
        return;
    }

    if (rhsHeader.isError()) {
        console.log('no rhs header: ', right.stringify())
        out.next(rhsHeader);
        out.done();
        return;
    }

    const strategy = getJoinStrategy(left.header(), right.header());

    if (strategy.error) {
        out.next(strategy.error);
        out.done();
    }

    // Emit header
    out.next(combineTuples([lhsHeader, rhsHeader])
             .setVal('command-meta', true).setVal('search-pattern', true));

    const lhsIndexed = new Map();

    for (const lhsTuple of left.body())
        lhsIndexed.set(getIndexKey(strategy, lhsTuple, 'left'), lhsTuple);

    for (const rhsTuple of right.body()) {
        const key = getIndexKey(strategy, rhsTuple, 'right');
        const lhsMatch = lhsIndexed.get(key);
        if (lhsMatch) {
            out.next(combineTuples([lhsMatch, rhsTuple]));
        }
    }

    out.done();
}

function isQuerySearchable(cxt: QueryContext, searchPattern: Tuple): Pipe {
    const abstractGet = searchPattern
        .setValue('verb', 'get')
        .setValue('get.scope', 'handlercheck');

    const pipe = new Pipe();

    cxt.graph.runCallback(abstractGet, (abstractResult) => {
        const searchable = !abstractResult.hasError();
        pipe.next(toTuple({searchable: searchable || null}));
        pipe.done();
    });

    return pipe;
}

function joinRhsSearchable(cxt: QueryContext, input: Pipe, searchPattern: Tuple, out: Stream) {

    const searchPipe = new Pipe();
    cxt.graph.run(searchPattern.setValue('verb','get'), searchPipe);

    input.whenDone(inputRel => {
        searchPipe.whenDone(searchRel => {
            joinRelations(inputRel, searchRel, out);
        });
    });
}

function getJoinStrategy(lhsHeader: Tuple, rhsHeader: Tuple): JoinStrategy {

    if (!lhsHeader)
        throw new Error("internal error: missing lhsHeader");

    const strategy: JoinStrategy = {
        pairs: []
    };

    // Does the rhsHeader have any identifiers?
    if (rhsHeader.hasAnyIdentifier()) {
        for (const rt of rhsHeader.identifierTags()) {
            const lt = lhsHeader.byIdentifier().get(rt.identifier);
            if (!lt) {
                continue;
            }

            strategy.pairs.push({ leftAttr: lt.attr, rightAttr: rt.attr });
        }
    } else {

        // Try to pair by matching attributes
        for (const rt of rhsHeader.tagsIt()) {
            if (rt.attr && lhsHeader.hasAttr(rt.attr)) {
                const lt = lhsHeader.getTag(rt.attr);
                strategy.pairs.push({ leftAttr: lt.attr, rightAttr: rt.attr });
            }
        }
    }

    if (strategy.pairs.length === 0)
        throw new Error(`No pair tags found to join, left = (${lhsHeader.stringify()}), right = (${rhsHeader.stringify()})`);

    if (strategy.pairs.length >= 2)
        throw new Error(`Unsupported - multiple pair tags in join, left = (${lhsHeader.stringify()}), right = (${rhsHeader.stringify()})`);

    return strategy;
}

function injectPatternWithJoinKey(strategy: JoinStrategy, leftTuple: Tuple, searchPattern: Tuple) {

    let result = searchPattern;

    for (const pair of strategy.pairs) {
        result = result.setValue(pair.rightAttr, leftTuple.getValue(pair.leftAttr));
    }

    return result;
}

function getIndexKey(strategy: JoinStrategy, tuple: Tuple, side: 'left' | 'right') {
    const key = [];
    for (const pair of strategy.pairs) {
        const attr = side === 'left' ? pair.leftAttr : pair.rightAttr;

        if (!tuple.hasAttr(attr)) {
            console.log(`tuple doesn't have expected key attr ${attr}: ${tuple.stringify()}`);
            return null;
        }

        key.push(tuple.getValue(attr));
    }
    return JSON.stringify(key);
}

function joinRhsNotSearchable(cxt: QueryContext, input: Pipe, searchPattern: Tuple, out: Stream) {

    // Figure out the header & join keys.
    let [ inputHeader, incoming ] = input.split(2);
    inputHeader = inputHeader.filter(t => t.isCommandSearchPattern());

    inputHeader.whenDone(rel => {
        const lhsHeader = rel.tuples[0];

        if (!lhsHeader) {
            out.next(jsErrorToTuple("No search-pattern found on piped input"))
            out.done();
            return;
        }

        const strategy = getJoinStrategy(lhsHeader, searchPattern);

        if (strategy.error) {
            out.next(strategy.error);
            out.done();
        }

        const addOutputStream = combineStreams(out);
        const doneRunningQueries = addOutputStream();

        const searchQuery = searchPattern.setValue('verb', 'get');

        // For each incoming value, run another search to get the joined row.
        incoming.sendTo({
            next(incomingTuple: Tuple) {
                if (incomingTuple.isCommandMeta())
                    return;

                const thisSearchOut = addOutputStream();
                cxt.graph.run(injectPatternWithJoinKey(strategy, incomingTuple, searchQuery), {
                    next(t) {
                        thisSearchOut.next(combineTuples([incomingTuple, t]));
                    },
                    done() {
                        thisSearchOut.done();
                    }
                });
            },
            done() {
                doneRunningQueries.done();
            }
        });
    });
}

export default function runJoinVerb(cxt: QueryContext, params: CommandParams) {

    const { input, output } = params;
    //let [ joinMeta, searchPattern ] = splitTuple(params.tuple, tag => tag.attr === 'join.piped_pattern');
    const searchPattern = params.tuple;

    isQuerySearchable(cxt, searchPattern)
    .whenDone(res => {
        if (res.bodyArray()[0].hasAttr('searchable')) {
            joinRhsSearchable(cxt, input, searchPattern, output);
        } else {
            joinRhsNotSearchable(cxt, input, searchPattern, output);
        }
    });
}

