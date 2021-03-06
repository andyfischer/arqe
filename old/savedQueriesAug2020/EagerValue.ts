/*
import Graph from './Graph'
import UpdateContext, { UpdateFn } from './UpdateContext'

export default class EagerValue<T> {
    graph: Graph
    id: string
    updateFn: UpdateFn<T>
    value: T

    constructor(graph: Graph, updateFn: UpdateFn<T>, initialValue?: T) {
        this.id = graph.eagerValueIds.take()
        this.value = initialValue;
        this.graph = graph;
        this.updateFn = updateFn;
    }

    runUpdate() {
        const context = new UpdateContext(this.graph);

        this.value = this.updateFn(context);

        for (const savedQuery of context.savedQueriesForUsedSearches()) {
            savedQuery.connectEagerValue(this);
        }
    }

    get() {
        return this.value;
    }
}
*/
