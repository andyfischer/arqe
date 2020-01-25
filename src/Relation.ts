
import Graph from './Graph'

interface RelationTag {
    tagType: string
    tagValue: string
}

export default class Relation {
    ntag: string
    payloadStr: string | null
    tags: RelationTag[]
    asMap: any = {}
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
            this.asMap[arg.tagType] = arg.tagValue || true;

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
        const found = this.asMap[typeName];
        if (found === undefined)
            return defaultValue;
        return found;
    }

    get(typeName: string) {
        const found = this.asMap[typeName];
        if (found === undefined)
            throw new Error("type not found: " + typeName);
        return found;
    }
    
    has(typeName: string) {
        return this.asMap[typeName] !== undefined;
    }

    includesType(name: string) {
        return this.asMap[name] !== undefined;
    }

    getTagValue(typeName: string): string | true | null {
        const found = this.tagsForType[typeName];
        if (!found)
            throw new Error("type not found: " + typeName);

        if (!found[0].tagValue)
            return true;

        return found[0].tagValue;
    }
}
