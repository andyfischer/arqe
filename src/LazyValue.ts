
/*
import Graph from './Graph'
import SavedQuery from './SavedQuery'
import UpdateContext, { UpdateFn } from './UpdateContext'
import SavedQueryWatch from './SavedQueryWatch'

export default class LazyValue<T> {
    graph: Graph
    updateFn: UpdateFn<T>

    hasValue: boolean = false
    value: T
    watchedQueries: SavedQueryWatch[] = []

    constructor(graph: Graph, updateFn: UpdateFn<T>) {
        this.graph = graph;
        this.updateFn = updateFn;
    }

    runUpdate() {
        const context = new UpdateContext(this.graph);

        this.value = this.updateFn(context);
        this.hasValue = true;

        this.watchedQueries = context.watchesForUsedSearches();
    }

    get(): T {
        if (!this.hasValue) {
            this.runUpdate();
            return this.value;
        }

        let changed = false;
        for (const query of this.watchedQueries) {
            changed = changed || query.checkChange();
        }

        if (changed) {
            this.runUpdate();
        }

        return this.value;
    }
}
*/
