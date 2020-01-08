
import Command, { CommandTag } from './Command'
import Graph, { RespondFunc } from './Graph'
import TagType from './TagType'
import Relation from './Relation'
import { normalizeExactTag, commandTagToString, commandArgsToString } from './parseCommand'
import RelationPattern from './RelationPattern'

export default class GetOperation {
    graph: Graph;
    command: Command;
    pattern: RelationPattern;
    respond: RespondFunc;

    constructor(graph: Graph, command: Command, respond: RespondFunc) {
        this.graph = graph;
        this.command = command;
        this.pattern = new RelationPattern(graph, command)
        this.respond = respond;
    }

    formattedListResult() {
        const variedType = this.pattern.starValueTags[0];

        // Return results. Use shorthand, don't mention tags that were provided exactly.
        const formattedResults = [];
        
        for (const rel of this.pattern.allMatches()) {
            formattedResults.push(this.pattern.formatRelation(rel))
        }

        return '[' + formattedResults.join(', ') + ']'
    }

    extendedResult() {
        return this.command.flags.x;
    }

    formattedSingleResult() {
        const found = this.pattern.findOneMatch();

        if (!found)
            return '#null'

        if (this.extendedResult()) {
            return this.graph.stringifyRelation(found);
        } else {
            return found.payloadStr;
        }
    }

    formattedResult(): string {
        if (this.pattern.isMultiMatch())
            return this.formattedListResult();
        else
            return this.formattedSingleResult();
    }
    
    perform() {
        this.respond(this.formattedResult());
    }
}
