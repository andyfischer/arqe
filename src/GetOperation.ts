
import Command, { CommandTag } from './Command'
import Graph, { RespondFunc } from './Graph'
import Schema from './Schema'
import TagType from './TagType'
import Relation from './Relation'
import { normalizeExactTag, commandTagToString, commandArgsToString } from './parseCommand'
import RelationPattern from './RelationPattern'

export default class GetOperation {
    graph: Graph;
    schema: Schema
    command: Command;
    pattern: RelationPattern;

    constructor(graph: Graph, command: Command) {
        this.graph = graph;
        this.schema = graph.schema;
        this.command = command;
        this.pattern = this.schema.relationPattern(command);
    }

    *formattedResults() {
        const variedType = this.pattern.starValueTags[0];

        for (const rel of this.pattern.allMatches(this.graph)) {
            yield this.pattern.formatRelationRelative(rel);
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
            return this.schema.stringifyRelation(found);
        } else {
            if (found.payloadStr)
                return found.payloadStr;
            else
                return '#exists'
        }
    }

    perform(respond: RespondFunc) {
        if (this.pattern.isMultiMatch()) {
            respond('#start');

            for (const s of this.formattedResults())
                respond(s);
            
            respond('#done');
        } else {
            respond(this.formattedSingleResult());
        }
    }
}
