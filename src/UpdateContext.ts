
import Graph from './Graph'
import Relation from './Relation'
import parseCommand from './parseCommand'
import SavedQuery from './SavedQuery'
import SavedQueryWatch from './SavedQueryWatch'
import CommandStep from './CommandStep'
import { singleCommandExecution } from './runCommand'

export type UpdateFn<T> = (cxt: UpdateContext) => T

export default class UpdateContext {

    graph: Graph
    usedSearches: string[] = []

    constructor(graph: Graph) {
        this.graph = graph;
    }

    get(tags: string): Relation[] {
        if (tags.startsWith('get '))
            throw new Error("getRelations(tags) should not include 'get': " + tags);

        const commandStr = 'get ' + tags;

        this.usedSearches.push(tags);

        const parsedCommand = parseCommand(commandStr);
        const commandExec = singleCommandExecution(this.graph, parsedCommand);
        commandExec.output.waitForAll(l => { rels = l });

        let rels: Relation[] = null;

        const search = commandExec.toRelationSearch();
        this.graph.tupleStore.searchUnplanned(search.pattern, search);

        if (rels === null)
            throw new Error("get didn't finish synchronously: " + commandStr);

        return rels;
    }

    getOne(tags: string): Relation {
        const rels = this.get(tags);
        if (rels.length === 0)
            throw new Error(`relation not found: ${tags}`);

        if (rels.length > 1)
            throw new Error(`expected one relation for: ${tags}`);

        return rels[0];
    }

    getRelations(tags: string): Relation[] {
        return this.get(tags);
    }

    getOptionsObject(tags: string): any {
        throw new Error(`don't use getOptionsObject`)
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
