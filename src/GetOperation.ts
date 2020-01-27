
import Command, { CommandTag } from './Command'
import Graph, { RespondFunc } from './Graph'
import Schema from './Schema'
import TagType from './TagType'
import Relation from './Relation'
import { normalizeExactTag, commandTagToString, commandArgsToString } from './parseCommand'
import RelationPattern from './RelationPattern'
import findAllMatches from './findAllMatches'

export default class GetOperation {
    graph: Graph;
    schema: Schema
    command: Command;
    pattern: RelationPattern;

    constructor(graph: Graph, command: Command) {
        this.graph = graph;
        this.schema = graph.schema;
        this.command = command;
        this.pattern = command.toPattern();
    }

    extendedResult() {
        return this.command.flags.x;
    }

    *formattedResults() {
        for (const rel of findAllMatches(this.graph, this.pattern)) {
            yield this.pattern.formatRelationRelative(rel);
        }
    }

    perform(respond: RespondFunc) {
        const expectMultiResults = this.pattern.isMultiMatch();

        if (expectMultiResults)
            respond('#start');

        let foundAny = false;

        for (const rel of findAllMatches(this.graph, this.pattern)) {
            foundAny = true;

            if (expectMultiResults) {
                respond(this.pattern.formatRelationRelative(rel));
            } else {
                if (this.extendedResult()) {
                    respond(this.schema.stringifyRelation(rel));
                } else {
                    if (rel.payloadStr) {
                        respond(rel.payloadStr);
                    } else {
                        respond('#exists');
                    }
                }
            }
        }

        if (expectMultiResults)
            respond('#done');

        if (!expectMultiResults && !foundAny)
            respond('#null');
    }
}
