/*
interface WatchedQuery {
    name: string
    savedQueryId: number
    latestChangeToken: number
}

export default class MultiSavedQueryWatch {
    graph: Graph
    watchedQueries: WatchedQuery[]

    constructor(graph: Graph) {
        this.graph = graph;
    }

    add(name: string, queryStr: string) {
        const savedQuery = this.graph.newSavedQuery(queryStr);

        this.watchedQueries.push({
            name,
            savedQueryId: savedQuery.id,
            latestChangeToken: 0
        });
    }

    getIfChanged() {
        for (const entry of this.watchedQueries) {
            if (entry.latestChangeToken !== this.graph.savedQueries[entry.id]) {
            }
        }
    }
}
*/
