
import Graph from './Graph'
import { normalizeExactTag } from './stringifyQuery'
import Schema from './Schema'
import RelationPattern, { PatternTag, FixedTag } from './RelationPattern'
import { commandTagsToString } from './stringifyQuery'

type Relation = RelationPattern
export default Relation;

/*
export default class Relation extends RelationPattern {

    constructor(tags: FixedTag[], payload: string | null) {

        super(tags);

        if (typeof payload !== 'string' && payload !== null)
            throw new Error('invalid value for payload: ' + payload)

        this.payload = payload;
        this.tags = tags;
    }

    stringifyPattern(schema?: Schema) {

        const tags = this.tags.map(t => t);

        if (schema)
            schema.ordering.sortTags(tags);

        return commandTagsToString(tags);
    }

    stringify(schema?: Schema) {

        let payload = '';

        if (this.payload !== null) {
            payload = ' == ' + this.payload;
        }

        let commandPrefix = 'set ';

        if (this.wasDeleted)
            commandPrefix = 'delete ';

        return commandPrefix + this.stringifyPattern(schema) + payload;
    }
}

*/
