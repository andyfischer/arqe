
import Graph from './Graph'
import Relation from './Relation'
import parseCommand from './parseCommand'
import SavedQuery from './SavedQuery'
import SavedQueryWatch from './SavedQueryWatch'
import CommandExecution from './CommandExecution'
import { runSearch } from './Search'
import { singleCommandExecution } from './ChainedExecution'

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
        runSearch(this.graph, search);

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
        const out = {};

        for (const option of this.getRelations(`${tags} option/*`)) {
            out[option.getTagValue("option") as string] = option.getPayload();
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
