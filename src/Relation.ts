
import Graph from './Graph'
import { normalizeExactTag } from './stringifyQuery'
import Schema from './Schema'
import RelationPattern, { PatternTag, FixedTag } from './RelationPattern'

export default class Relation {

    private payloadStr: string | null

    // 'payloadUnavailable' means that this relation might or might not have a payload,
    // but we don't know what it is. With this enabled it's error to try to access the payload.
    payloadUnavailable?: boolean

    tags: FixedTag[]

    pattern: RelationPattern

    wasDeleted?: boolean

    constructor(tags: FixedTag[], payloadStr: string | null) {

        if (typeof payloadStr !== 'string' && payloadStr !== null)
            throw new Error('invalid value for payloadStr: ' + payloadStr)

        this.pattern = new RelationPattern(tags);

        if (payloadStr === '#exists')
            payloadStr = null;

        this.payloadStr = payloadStr;
        this.tags = tags;
    }
    
    hasPayload() {
        if (this.payloadUnavailable)
            throw new Error("Payload is unavailable for this relation");

        return this.payloadStr != null;
    }

    payload() {
        if (this.payloadUnavailable)
            throw new Error("Payload is unavailable for this relation");

        return this.payloadStr;
    }

    setPayload(payloadStr: string | null) {
        this.payloadStr = payloadStr;
    }

    stringifyPattern(schema?: Schema) {
        const keys = this.tags.map(t => t.tagType);

        if (schema)
            keys.sort((a,b) => schema.ordering.compareTagTypes(a, b));

        const args = keys.map(key => {
            const value: string | true = this.pattern.getTagValue(key);
            if (key === 'option')
                return '.' + (value as string);

            let str = key;

            if ((value as any) !== true)
                str += `/${value}`

            return str;
        });

        return args.join(' ');
    }

    stringify(schema?: Schema) {

        let payload = '';

        if (this.payloadStr !== null) {
            payload = ' == ' + this.payloadStr;
        }

        let commandPrefix = 'set ';

        if (this.wasDeleted)
            commandPrefix = 'delete ';

        return commandPrefix + this.stringifyPattern(schema) + payload;
    }
}

export function commandTagsToRelation(tags: PatternTag[], payload: string): Relation {
    const relationTags = tags.map(t => ({
        tagType: t.tagType,
        tagValue: t.tagValue
    }));

    return new Relation(relationTags, payload);
}
