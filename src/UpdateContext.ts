
import Graph from './Graph'
import Relation from './Relation'
import parseCommand from './parseCommand'
import GetOperation from './GetOperation'
import SavedQuery from './SavedQuery'
import SavedQueryWatch from './SavedQueryWatch'

export type UpdateFn<T> = (cxt: UpdateContext) => T

export default class UpdateContext {

    graph: Graph

    usedSearches: string[] = []

    constructor(graph: Graph) {
        this.graph = graph;
    }

    getRelations(tags: string): Relation[] {
        if (tags.startsWith('get '))
            throw new Error("getRelations(tags) should not include 'get': " + tags);

        const commandStr = 'get ' + tags;

        this.usedSearches.push(tags);

        const parsedCommand = parseCommand(commandStr);
        const get = new GetOperation(this.graph, parsedCommand);

        let rels: Relation[] = null;

        get.outputToRelationList(l => { rels = l });
        get.run();

        if (rels === null)
            throw new Error("get didn't finish synchronously: " + commandStr);

        return rels;
    }

    savedQueriesForUsedSearches(): SavedQuery[] {
        return this.usedSearches.map(sawSearch =>
                                     this.graph.savedQuery('get ' + sawSearch))
    }

    watchesForUsedSearches(): SavedQueryWatch[] {
        return this.savedQueriesForUsedSearches().map(savedQuery =>
            new SavedQueryWatch(savedQuery)
        );
    }
}
