

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

export interface DataProvider {
    findAllMatches: (pattern: RelationPattern) => any
}

interface Step {
    checkProvider: DataProvider
}

export default class ExecutionPlan {
    steps: Step[]

    constructor(graph: Graph, command: Command) {
        this.steps = [{
            checkProvider: graph.inMemory
        }]
    }

    *findAllMatches(pattern: RelationPattern) {
        for (const step of this.steps) {
            yield* step.checkProvider.findAllMatches(pattern);
        }
    }
}