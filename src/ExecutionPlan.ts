

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

type PlanType = 'in-memory'

export default class ExecutionPlan {
    planType: PlanType

    constructor(command: Command, schema: Schema) {
        this.planType = 'in-memory';
    }
}
