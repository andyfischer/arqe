import Query from "./Query";
import CompoundQuery from "./CompoundQuery";
import { Graph, Tuple, Stream } from ".";
import findPartitionsByTable from "./findPartitionsByTable";

export default class QueryWatch {
    graph: Graph
    query: CompoundQuery
    id: string

    constructor(graph: Graph, query: CompoundQuery) {
        this.graph = graph;
        this.query = query;
        this.id = this.graph.nextWatchId.take();
    }

    start(out: Stream) {
        for (const singleQuery of this.query.queries) {
            if (singleQuery.commandName === 'get' || singleQuery.commandName === 'join') {
                const pattern = singleQuery.pattern;
                this.initOneTableWatch(pattern, out);
            }
        }
    }

    initOneTableWatch(pattern: Tuple, out: Stream) {
        for (const [table, partitionedTuple] of findPartitionsByTable(this.graph, pattern)) {
            table.addWatch(partitionedTuple, this.id, this, out);
        }
    }
    
    initWatches() {
    }
}