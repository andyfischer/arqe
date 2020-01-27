

// Schema patterns can be declared
// Each pattern has identity
// Patterns can have specified storage
// Patterns can have storage-specific info (like filesystem directory, etc)
// Patterns are ordered

// declare-plain-relation type1/* type2/*

// Access time:
//  Every time a query comes in, find the matching pattern and resolve the query
//  using that.


// Schemas to support:
//   in-memory
//   filesystem
//   in-memory object
//   branch..?
//   snapshot..?

import Command from './Command'
import Schema from './Schema'
import Relation from './Relation'
import RelationPattern from './RelationPattern'
import Graph from './Graph'
import StorageProvider from './StorageProvider'

interface Step {
    storage: StorageProvider
    subtractTypes?: string[]
}

function findStoragePlugin(schema: Schema, command: Command) {
    // TODO
}

export default class ExecutionPlan {
    steps: Step[]

    constructor(graph: Graph, command: Command) {
        this.steps = [{
            storage: graph.inMemory
        }];

        let inheritTagTypes: string[] = []

        for (const tag of command.tags) {
            const tagInfo = graph.schema.findTagType(tag.tagType);
            
            if (tagInfo.inherits) {

                inheritTagTypes.push(tag.tagType);

                this.steps.push({
                    storage: graph.inMemory,
                    subtractTypes: [tag.tagType]
                });
            }
        }

        if (inheritTagTypes.length >= 2) {
            this.steps.push({
                storage: graph.inMemory,
                subtractTypes: inheritTagTypes
            });
        }
    }

    *findAllMatches(pattern: RelationPattern) {
        const expectOne = !pattern.isMultiMatch();

        for (const step of this.steps) {

            let stepPattern = pattern;

            if (step.subtractTypes) {
                for (const t of step.subtractTypes)
                    stepPattern = stepPattern.patternWithoutType(t);
            }

            for (const rel of step.storage.findAllMatches(stepPattern)) {
                yield rel;

                if (expectOne) {
                    return;
                }
            }
        }
    }

    save(command: Command) {
        for (const step of this.steps) {
            return step.storage.save(command);
        }
    }
}
