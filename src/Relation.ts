
import { CommandTag } from './Command'
import Graph from './Graph'

export default class Relation {
    ntag: string
    payloadStr: any
    tags: CommandTag[]
    tagCount: number
    asMap: any = {}
    graph: Graph

    constructor(graph: Graph, ntag: string, tags: CommandTag[], payloadStr: string) {
        this.graph = graph;
        this.ntag = ntag;
        this.payloadStr = payloadStr || '#exists';
        this.tags = tags;
        this.tagCount = tags.length;

        for (const arg of tags) {
            this.asMap[arg.tagType] = arg.tagValue || true;
        }
    }

    hasPayload() {
        return this.payloadStr !== '#exists'
    }

    *eachTag() {
        for (const tag of this.tags)
            yield tag;
    }

    setPayload(payloadStr: string) {
        this.payloadStr = payloadStr || '#exists';
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
