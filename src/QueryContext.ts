import Graph from "./Graph";
import Query from "./Query";
import Pipe from "./Pipe";

export default class QueryContext {
    graph: Graph

    input: Pipe
    callingQuery: Query

    enableDebugDumpTrace = false;
    depth = 0

    constructor(graph: Graph) {
        this.graph = graph;
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
}