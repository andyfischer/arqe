
import Graph from './Graph'
import Relation from './Relation'
import parseCommand from './parseCommand'
import SavedQuery from './SavedQuery'
import SavedQueryWatch from './SavedQueryWatch'
import CommandExecution from './CommandExecution'
import { runSearch } from './Search'

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
        const commandExec = new CommandExecution(this.graph, parsedCommand);
        commandExec.outputToRelationList(l => { rels = l });

        let rels: Relation[] = null;

        const search = commandExec.toRelationSearch();
        search.start();
        runSearch(this.graph, search);

        if (rels === null)
            throw new Error("get didn't finish synchronously: " + commandStr);

        return rels;
    }

    getOptionsObject(tags: string): any {
        const out = {};

        for (const option of this.getRelations(`${tags} option/*`)) {
            out[option.getTagValue("option") as string] = option.payload();
        }

        return out;
    }

    savedQueriesForUsedSearches(): SavedQuery[] {
        return this.usedSearches.map(sawSearch =>
                                     this.graph.savedQuery(sawSearch))
    }

    watchesForUsedSearches(): SavedQueryWatch[] {
        return this.savedQueriesForUsedSearches().map(savedQuery =>
            new SavedQueryWatch(savedQuery)
        );
    }
}

export function runUpdateOnce<T>(graph: Graph, fn: UpdateFn<T>): T {
    const cxt = new UpdateContext(graph);
    return fn(cxt);
}
