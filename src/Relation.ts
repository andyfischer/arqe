
import Graph from './Graph'
import { normalizeExactTag } from './stringifyQuery'
import Schema from './Schema'
import RelationPattern, { PatternTag, FixedTag } from './RelationPattern'

export default class Relation {
    ntag: string

    private payloadStr: string | null

    // 'payloadUnavailable' means that this relation might or might not have a payload,
    // but we don't know what it is. With this enabled it's error to try to access the payload.
    payloadUnavailable?: boolean

    tags: FixedTag[]
    tagsForType: { [typeName: string]: FixedTag[] } = {}

    constructor(ntag: string | null, tags: FixedTag[], payloadStr: string | null) {
        this.ntag = ntag || normalizeExactTag(tags);

        if (typeof payloadStr !== 'string' && payloadStr !== null)
            throw new Error('invalid value for payloadStr: ' + payloadStr)

        if (payloadStr === '#exists')
            payloadStr = null;

        this.payloadStr = payloadStr;
        this.tags = tags;

        for (const arg of tags) {
            if (!this.tagsForType[arg.tagType])
                this.tagsForType[arg.tagType] = [];
            this.tagsForType[arg.tagType].push(arg);
        }
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

    *eachTag() {
        for (const tag of this.tags)
            yield tag;
    }

    setPayload(payloadStr: string | null) {
        this.payloadStr = payloadStr;
    }
    
    getOptional(typeName: string, defaultValue) {
        const found = this.tagsForType[typeName];

        if (!found)
            return defaultValue;

        return found[0].tagValue;
    }
    
    includesType(name: string) {
        return this.tagsForType[name] !== undefined;
    }

    hasValueForType(name: string) {
        if (!this.tagsForType[name])
            return false;

        for (const tag of this.tagsForType[name])
            if (tag.tagValue !== null)
                return true;

        return false;
    }

    tagCount() {
        return this.tags.length;
    }

    getTag(typeName: string): string | null {
        const found = this.tagsForType[typeName];
        if (!found)
            throw new Error("type not found: " + typeName);

        if (!found[0].tagValue)
            return typeName;

        return typeName + '/' + found[0].tagValue;
    }

    getTagValue(typeName: string): string | true | null {
        const found = this.tagsForType[typeName];
        if (!found)
            throw new Error("type not found: " + typeName);

        if (!found[0].tagValue)
            return true;

        return found[0].tagValue;
    }

    stringify(schema?: Schema) {
        const keys = this.tags.map(t => t.tagType);

        if (schema)
            keys.sort((a,b) => schema.ordering.compareTagTypes(a, b));

        const args = keys.map(key => {
            const value = this.getTagValue(key);
            if (key === 'option')
                return '.' + value;

            let str = key;

            if (value !== true)
                str += `/${value}`

            return str;
        });

        let payload = '';

        if (this.payloadStr !== null) {
            payload = ' == ' + this.payloadStr;
        }

        return 'set ' + args.join(' ') + payload;
    }

    pattern() {
        return new RelationPattern(this.tags);
    }
}

export function commandTagsToRelation(tags: PatternTag[], payload: string): Relation {
    const relationTags = tags.map(t => ({
        tagType: t.tagType,
        tagValue: t.tagValue
    }));

    return new Relation(null, relationTags, payload);
}
