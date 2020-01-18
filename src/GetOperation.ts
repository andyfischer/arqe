
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
        this.pattern = graph.schema.relationPattern(command);
        this.respond = respond;
    }

    *formattedResults() {
        const variedType = this.pattern.starValueTags[0];

        // Return results. Use shorthand, don't mention tags that were provided exactly.
        const formattedResults = [];
        
        for (const rel of this.pattern.allMatches(this.graph)) {
            yield this.pattern.formatRelation(rel);
        }
    }

    extendedResult() {
        return this.command.flags.x;
    }

    formattedSingleResult() {
        const found = this.pattern.findOneMatch(this.graph);

        if (!found)
            return '#null'

        if (this.extendedResult()) {
            return this.graph.stringifyRelation(found);
        } else {
            return found.payloadStr;
        }
    }

    perform() {
        if (this.pattern.isMultiMatch()) {
            this.respond('#start');
            for (const s of this.formattedResults()) {
                this.respond(s);
            }
            this.respond('#done');
        } else {
            this.respond(this.formattedSingleResult());
        }
    }
}
