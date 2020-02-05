
import Graph from './Graph'
import Relation from './Relation'
import parseCommand from './parseCommand'
import GetOperation from './GetOperation'

export type UpdateFn<T> = (cxt: UpdateContext) => T

export default class UpdateContext {

    graph: Graph

    sawSearches: string[] = []

    constructor(graph: Graph) {
        this.graph = graph;
    }

    getRelations(tags: string): Relation[] {
        const commandStr = 'get ' + tags;

        this.sawSearches.push(tags);

        const parsedCommand = parseCommand(commandStr);
        const get = new GetOperation(this.graph, parsedCommand);

        let rels: Relation[] = null;

        get.outputToRelationList(l => { rels = l });
        get.run();

        if (rels === null)
            throw new Error("get didn't finish synchronously: " + commandStr);

        return rels;
    }

}
