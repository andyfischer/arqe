
import Graph from './Graph'
import UpdateContext, { UpdateFn } from './UpdateContext'

export default class EagerValue<T> {
    graph: Graph
    updateFn: UpdateFn<T>

    value: T

    constructor(graph: Graph, updateFn: UpdateFn<T>, initialValue: T) {
        this.value = initialValue;
        this.graph = graph;
        this.updateFn = updateFn;
    }

    runUpdate() {
    }
}
