
import CommandExecutionParams from '../CommandExecutionParams'
import Tuple, { tagsToTuple } from '../Tuple';
import Stream from '../Stream';
import { receiveToTupleList } from '../receiveUtils';
import Relation from '../Relation';
import { joinNStreams } from '../StreamUtil';
import AutoInitMap from '../utils/AutoInitMap';
import TupleTag from '../TupleTag';
import { emitCommandError, emitSearchPatternMeta } from '../CommandMeta';

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

    return tagsToTuple(tags);
}

function joinRelations(origRels: Relation[], out: Stream) {

    const rels: JoiningRelation[] = [];
    for (let index = 0; index < origRels.length; index++) {
        rels.push(new JoiningRelation(index, origRels[index]))
    }

    // Find identifiers
    const identifiers = new AutoInitMap<string, FoundIdentifier>(str => new FoundIdentifier(str))

    for (const rel of rels) {
        for (const headerTag of rel.rel.header.tags) {
            if (headerTag.hasIdentifier()) {
                identifiers.get(headerTag.identifier).add(rel.index, headerTag);
            }
        }
    }

    // Look at 'common' identifiers that are used in all relations.
    const commonIdentifiers: FoundIdentifier[] = []
    for (const found of identifiers.values()) {
        if (found.foundRelCount === rels.length)
            commonIdentifiers.push(found);
    }

    if (commonIdentifiers.length === 0) {
        emitCommandError(out, "No common identifiers found across incoming relations");
        out.done();
        return;
    }

    // Hash all tuples using the identifiers
    const hashed = new AutoInitMap<string, { tuples: Tuple[] }>(_ => ({ tuples: [] }) );

    for (const rel of rels) {
        for (let tup of rel.rel.tuples) {

            // Figure out join hash
            const hash = commonIdentifiers.map((found: FoundIdentifier) => {
                const attr = found.byRelIndex.get(rel.index).attr;
                return tup.getVal(attr);
            }).join(',');

            // Update tuples with identifiers
            hashed.get(hash).tuples.push(tup);
        }
    }

    // Emit header
    out.next(combineTuples(rels.map(rel => rel.rel.header)));

    // Emit combined tuples
    for (const hashedTupleList of hashed.values()) {

        // Inner join: Only include this if it found a match in each relation.
        if (hashedTupleList.tuples.length !== rels.length)
            continue;

        out.next(combineTuples(hashedTupleList.tuples))
    }

    out.done();
}

function performJoinWithData(out: Stream): Stream {
    return receiveToTupleList((tuples: Tuple[]) => {
        if (tuples.length !== 2)
            throw new Error('internal error, expected 2-element list in performJoinWithData()');

        const input: Relation = tuples[0].getValOptional('input', null) || tuples[1].getValOptional('input', null);
        const search: Relation = tuples[0].getValOptional('search', null) || tuples[1].getValOptional('search', null);

        if (!input)
            throw new Error('internal error: missing "input" relation')

        if (!search)
            throw new Error('internal error: missing "search" relation')

        if (!input.header) {
            emitCommandError(out, "Input relation is missing header");
            out.done();
            return;
        }

        if (!search.header) {
            emitCommandError(out, "Search relation is missing header");
            out.done();
            return;
        }

        joinRelations([input, search], out);
    })
}

export default function runJoinStep(params: CommandExecutionParams) {

    const { graph, command, input, output } = params;
    const searchPattern = command.pattern;

    // Collect two relations: input (piped) & search 
    const [inputStream, searchOut] = joinNStreams(2, performJoinWithData(output));
    input.sendRelationTo(inputStream, 'input');
    graph.sendRelationValue(searchPattern, searchOut, 'search');
}


