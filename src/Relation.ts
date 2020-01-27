
import Graph from './Graph'
import { CommandTag } from './Command'
import { normalizeExactTag } from './parseCommand'
import Schema from './Schema'

interface RelationTag {
    tagType: string
    tagValue: string
}

export default class Relation {
    ntag: string
    payloadStr: string | null
    tags: RelationTag[]
    tagsForType: { [typeName: string]: RelationTag[] } = {}

    constructor(ntag: string, tags: RelationTag[], payloadStr: string | null) {
        this.ntag = ntag;

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
        return this.payloadStr != null;
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

    tagCount() {
        return this.tags.length;
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
}

export function commandTagsToRelation(tags: CommandTag[], payload: string): Relation {
    const ntag = normalizeExactTag(tags);

    const relationTags = tags.map(t => ({
        tagType: t.tagType,
        tagValue: t.tagValue
    }));

    return new Relation(ntag, relationTags, payload);
}
