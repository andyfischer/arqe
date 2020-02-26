
import Graph from './Graph'
import Relation from './Relation'
import parseCommand, { parseCommandChain } from './parseCommand'
import CommandExecution from './CommandExecution'
import { receiveToRelationList } from './RelationReceiver'
import { runCommandChain } from './ChainedExecution'

export default class GraphRelationSyncAPI {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    run(command: string): Relation[] {
        const chain = parseCommandChain(command);

        let rels: Relation[] = null;
        const output = receiveToRelationList(l => { rels = l });

        runCommandChain(this.graph, chain, output);

        if (rels === null)
            throw new Error("Command didn't finish synchronously: " + command);

        return rels.filter(rel => !rel.hasType('command-meta'));
    }

    get(pattern: string): Relation[] {
        return this.run('get ' + pattern);
    }

    getOne(pattern: string): Relation {
        const rels = this.get(pattern);
        if (rels.length === 0)
            throw new Error("getOne didn't find any relations for: " + pattern);

        if (rels.length > 1)
            throw new Error("getOne found multple relations for: " + pattern);

        return rels[0];
    }
}
