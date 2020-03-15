
import Graph from './Graph'
import Pattern from './Pattern'

export default class GraphListenerV2 {
    graph: Graph
    id: string
    callback: () => void
    pattern: Pattern

    constructor(graph: Graph, pattern: Pattern, callback: () => void) {
        this.graph = graph;
        this.pattern = pattern;
        this.callback = callback;
        this.id = graph.graphListenerIds.take()

        if (graph.graphListenersV2[this.id])
            throw new Error('internal error: graph listener ID is already in use')

        graph.graphListenersV2[this.id] = this;
    }

    trigger() {
        this.callback()
    }

    close() {
        delete this.graph.graphListenersV2[this.id];
    }
}
