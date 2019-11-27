
import Graph from './Graph'
import { CommandArg } from './Command'
import Relation from './Relation'

export default class FullSearch {
    graph: Graph;
    fixedArgs: CommandArg[] = []
    starArgs: CommandArg[] = []

    constructor(graph: Graph, args: CommandArg[]) {
        this.graph = graph;
        for (const arg of args)
            if (arg.star)
                this.starArgs.push(arg);
            else
                this.fixedArgs.push(arg);
    }

    relationMatches(rel: Relation) {
        for (const arg of this.fixedArgs) {
            if (!arg.tagValue) {
                if (!rel.asMap[arg.tagType])
                    return false;

                continue;
            }

            if (rel.asMap[arg.tagType] !== arg.tagValue)
                return false;
        }

        for (const arg of this.starArgs)
            if (!rel.asMap[arg.tagType])
                return false;

        return true;
    }

    run() {
        const found = [];
        const graph = this.graph;
        for (const ntag in graph.relationsByNtag) {
            const rel = graph.relationsByNtag[ntag];
            if (this.relationMatches(rel))
                found.push(rel);
        }
        return found;
    }

}
