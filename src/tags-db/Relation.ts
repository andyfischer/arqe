
import { CommandTag } from './Command'
import Graph from './Graph'

export default class Relation {
    ntag: string
    payloadStr: any
    asMap: any = {}
    graph: Graph

    constructor(graph: Graph, ntag: string, tags: CommandTag[], payloadStr: string) {
        this.graph = graph;
        this.ntag = ntag;
        this.payloadStr = payloadStr || '#exists';

        for (const arg of tags) {
            this.asMap[arg.tagType] = arg.tagValue || true;
        }
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

    tags() {
        const result = [];
        for (const key in this.asMap) {
            result.push({key, value: this.asMap[key]});
        }
        return result;
    }

    includesType(name: string) {
        return this.asMap[name] !== undefined;
    }
}
