
import CommandExecutionParams from '../CommandExecutionParams'
import receiveToStringList from '../receiveToStringList';
import Tuple from '../Tuple';
import Stream from '../Stream';
import { receiveToTupleList } from '../receiveUtils';
import Relation, { getRelation } from '../Relation';
import { joinNStreams } from '../StreamUtil';

function joinRelations(rels: Relation[], out: Stream) {
    // Find common identifiers
    const allIdentifiers = {};

    for (let relIndex = 0; relIndex < rels.length; relIndex++) {
        const rel = rels[relIndex];
        for (const headerTag of rel.header.tags) {
            if (headerTag.hasIdentifier()) {
                // TODO
            }
        }
    }

    // Ignore identifiers that aren't shared

    // Hash all tuples using the identifiers

    // Emit combined tuples
}

function performJoinWithData(finalOutput: Stream): Stream {
    return receiveToTupleList((tuples: Tuple[]) => {
        if (tuples.length !== 2)
            throw new Error('internal error, expected 2-element list in performJoinWithData()');

        const piped: Relation = tuples[0].getValOptional('piped', null) || tuples[1].getValOptional('piped', null);
        const search: Relation = tuples[0].getValOptional('search', null) || tuples[1].getValOptional('search', null);
    })
}

export function runJoinStep(params: CommandExecutionParams) {

    const { graph, command, input, output } = params;
    const searchPattern = command.pattern;

    // Collect two relations: input (piped) & search 
    const [inputStream, searchOut] = joinNStreams(2, performJoinWithData(output));
    input.sendRelationTo(inputStream, 'input');
    getRelation(graph, searchPattern, searchOut, 'search');
}


