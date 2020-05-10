"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GraphListenerV2 {
    constructor(graph, pattern, callback) {
        this.graph = graph;
        this.pattern = pattern;
        this.callback = callback;
        this.id = graph.graphListenerIds.take();
        if (graph.graphListenersV2[this.id])
            throw new Error('internal error: graph listener ID is already in use');
        graph.graphListenersV2[this.id] = this;
    }
    trigger() {
        this.callback();
    }
    close() {
        delete this.graph.graphListenersV2[this.id];
    }
}
exports.default = GraphListenerV2;
//# sourceMappingURL=GraphListenerV2.js.map