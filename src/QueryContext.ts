import Graph from "./Graph";
import Command from "./Command";
import Pipe from "./utils/Pipe";
import LiveQuery, { LiveQueryId } from './LiveQuery'
import Tuple from './Tuple'
import { QueryLike } from './coerce'
import Stream from './Stream'

export default class QueryContext {
    graph: Graph
    parent?: QueryContext

    env?: Tuple

    watchingQueries = new Map<LiveQueryId, LiveQuery>()

    input: Pipe
    verb: string

    traceEnabled = false;
    enableDebugDumpTrace = false;
    depth = 0

    constructor(graph: Graph, parent?: QueryContext) {
        this.graph = graph;
        this.parent = parent;
        this.traceEnabled = parent && parent.traceEnabled;
    }

    newChild() {
        return new QueryContext(this.graph, this);
    }

    *eachWatchingQuery(): Iterable<LiveQuery> {
        for (const query of this.watchingQueries.values()) {
            yield query;
        }

        if (this.parent)
            yield* this.parent.eachWatchingQuery();
    }

    _print(msg) {
        console.log(' '.repeat(this.depth) + msg);
    }

    log(tags: any) {
        if (this.enableDebugDumpTrace) {
            this._print(JSON.stringify(tags));
        }
    }

    msg(name: string, attrs: any = {}) {
        this.log({ ...attrs, msg: name })
    }

    start(id: string, tags: any = {}) {
        if (this.enableDebugDumpTrace) {
            this._print(`start: ${id} ${JSON.stringify(tags)}`);
            this.depth += 1;
        }
    }

    end(id: string) {
        if (this.enableDebugDumpTrace) {
            this.depth -= 1;
            this._print(`end: ${id}`);
        }
    }

    getEnv(attr: string) {
        if (this.env && this.env.hasAttr(attr))
            return this.env.get(attr);

        if (this.parent)
            return this.parent.getEnv(attr);

        return null;
    }

    makeSubquery(queryLike: QueryLike, out: Stream) {
        this.graph.run(queryLike, out);
    }
}
