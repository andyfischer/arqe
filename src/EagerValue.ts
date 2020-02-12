
import Graph from './Graph'
import UpdateContext, { UpdateFn } from './UpdateContext'

export default class EagerValue<T> {
    graph: Graph
    id: number
    updateFn: UpdateFn<T>
    value: T

    constructor(graph: Graph, updateFn: UpdateFn<T>, initialValue?: T) {
        this.id = graph.nextEagerValueId;
        this.value = initialValue;
        graph.nextEagerValueId += 1;
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
