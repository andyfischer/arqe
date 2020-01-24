
import { CommandTag } from './Command'
import Graph from './Graph'

export default class Relation {
    ntag: string
    payloadStr: string | null
    tags: CommandTag[]
    tagCount: number
    asMap: any = {}
    graph: Graph

    constructor(graph: Graph, ntag: string, tags: CommandTag[], payloadStr: string | null) {
        this.graph = graph;
        this.ntag = ntag;

        if (typeof payloadStr !== 'string' && payloadStr !== null)
            throw new Error('invalid value for payloadStr: ' + payloadStr)

        if (payloadStr === '#exists')
            payloadStr = null;

        this.payloadStr = payloadStr;
        this.tags = tags;
        this.tagCount = tags.length;

        for (const arg of tags) {
            this.asMap[arg.tagType] = arg.tagValue || true;
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
}
