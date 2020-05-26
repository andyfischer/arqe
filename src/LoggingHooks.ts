
import Graph from './Graph'

export default class LoggingHooks {
    graph: Graph
    active: false

    constructor(graph: Graph) {
        this.graph = graph;

    }

    send(channel: string, message: string, fields: { [key: string]: string }) {
        if (!this.active)
            return;
    }
}
